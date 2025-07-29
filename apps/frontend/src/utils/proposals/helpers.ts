import {
  FilterStatuses,
  ProposalCardType,
  ProposalEvent,
  ProposalState,
  ProposalStatus,
  SingleChoiceEnum,
} from "@/types/proposal";
import dayjs from "dayjs";
import { Delta } from "quill";
import { IpfsDetails } from "@/types/ipfs";
import { HexUInt } from "@vechain/sdk-core";
import { thorClient } from "../thorClient";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";

const AVERAGE_BLOCK_TIME = 10; // in seconds

export type FromEventsToProposalsReturnType = ({ ipfsHash: string } & Omit<
  ProposalCardType,
  "status" | "description" | "title" | "votingQuestion" | "headerImage"
>)[];

export const getStatusFromState = (state: ProposalState): ProposalStatus => {
  switch (state) {
    case ProposalState.PENDING:
      return "upcoming";
    case ProposalState.DEFEATED:
      return "min-not-reached";
    case ProposalState.ACTIVE:
      return "voting";
    case ProposalState.CANCELED:
      return "canceled";
    case ProposalState.EXECUTED:
      return "executed";
    case ProposalState.SUCCEEDED:
      return "approved";
    default:
      return "upcoming";
  }
};

export const getStatusParProposalMethod = (proposalIds?: string[]) => {
  return proposalIds?.map(id => ({
    method: "state" as const,
    args: [id],
  }));
};

export const getIndexFromSingleChoice = (choice: SingleChoiceEnum): 0 | 1 | 2 => {
  switch (choice) {
    case SingleChoiceEnum.AGAINST:
      return 0;
    case SingleChoiceEnum.FOR:
      return 1;
    case SingleChoiceEnum.ABSTAIN:
      return 2;
    default:
      throw new Error(`Invalid choice: ${choice}`);
  }
};

export const getSingleChoiceFromIndex = (index: 0 | 1 | 2): SingleChoiceEnum => {
  return defaultSingleChoice[index];
};

export const filterStatus = (statuses: FilterStatuses[], status: ProposalStatus): boolean => {
  if (status === "min-not-reached") return statuses.includes("rejected");
  return statuses.includes(status);
};

export const fromEventsToProposals = async (events: ProposalEvent[]): Promise<FromEventsToProposalsReturnType> => {
  return await Promise.all(
    events.map(async event => {
      const [startDate, endDate] = await Promise.all([
        getDateFromBlock(Number(event.startTime)),
        getDateFromBlock(Number(event.startTime) + Number(event.voteDuration)),
      ]);

      return {
        id: event.proposalId,
        proposer: event.proposer,
        createdAt: startDate,
        startDate,
        endDate,
        ipfsHash: event.description,
        reason: event.reason,
        executedProposalLink: event.executedProposalLink,
      };
    }),
  );
};

export const sanitizeImageUrl = (url?: string) => {
  if (!url) return "";
  const prefix = "ipfs://";
  if (url.startsWith(prefix)) return `https://${url.split(prefix)[1]}.ipfs.dweb.link/`;
  else return url;
};

export const mergeIpfsDetails = (
  ipfsData: (IpfsDetails | undefined)[],
  proposals?: FromEventsToProposalsReturnType,
) => {
  return proposals?.map(p => {
    const currentIpfsProposal = ipfsData.filter(d => (d?.ipfsHash || "") === p.ipfsHash)[0];

    return {
      ...p,
      title: currentIpfsProposal?.title || "",
      description: new Delta(currentIpfsProposal?.markdownDescription || []).ops,
      votingQuestion: currentIpfsProposal?.shortDescription || "",
      headerImage: {
        type: currentIpfsProposal?.headerImage?.type || "",
        name: currentIpfsProposal?.headerImage?.name || "",
        size: currentIpfsProposal?.headerImage?.size || 1,
        url: currentIpfsProposal?.headerImage?.url || "/images/proposal_example.png",
      },
    };
  });
};

export const getBlockFromDate = async (
  date: Date,
): Promise<{
  number: number;
  id: string;
}> => {
  const currentBlock = await thorClient.blocks.getFinalBlockExpanded();
  const currentTimestamp = currentBlock?.timestamp || 0; // in seconds
  const currentBlockNumber = currentBlock?.number || 0; // current block number

  const targetTimestamp = Math.floor(dayjs(date).unix()); // in seconds

  const blocksUntilTarget = Math.floor((targetTimestamp - currentTimestamp) / AVERAGE_BLOCK_TIME);
  const number = currentBlockNumber + blocksUntilTarget;
  const compressed = await thorClient.blocks.getBlockCompressed(number);
  return {
    number,
    id: compressed?.id || "",
  };
};

export const getDateFromBlock = async (blockNumber: number): Promise<Date> => {
  const currentBlock = await thorClient.blocks.getFinalBlockExpanded();
  const currentTimestamp = currentBlock?.timestamp || 0;
  const currentBlockNumber = currentBlock?.number || 0;

  if (blockNumber <= currentBlockNumber) {
    const block = await thorClient.blocks.getBlockCompressed(blockNumber);
    const timestamp = block?.timestamp ?? currentTimestamp;
    return dayjs(timestamp * 1000).toDate();
  }

  const estimatedSecondsIntoFuture = (blockNumber - currentBlockNumber) * AVERAGE_BLOCK_TIME;
  const estimatedTimestamp = currentTimestamp + estimatedSecondsIntoFuture;
  return dayjs(estimatedTimestamp * 1000).toDate();
};

export const fromStringToUint256 = (str: string) => {
  const hexString = BigInt(str).toString(16);
  return HexUInt.of("0x" + hexString).toString();
};
