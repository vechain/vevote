import { ProposalEvent, ProposalState } from "@/types/blockchain";
import { BaseOption, ProposalCardType, ProposalStatus, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import dayjs from "dayjs";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { isArraysEqual } from "../array";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { Delta } from "quill";
import { IpfsDetails } from "@/types/ipfs";
import { HexUInt } from "@vechain/sdk-core";
import { thorClient } from "../thorClient";

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

export const fromEventsToProposals = async (events: ProposalEvent[]): Promise<FromEventsToProposalsReturnType> => {
  return await Promise.all(
    events.map(async event => {
      const isSingleOption = Number(event.maxSelection) === 1;
      const decodedChoices = event.choices.map(c => ethers.decodeBytes32String(c));

      const votingType = isArraysEqual(decodedChoices, defaultSingleChoice)
        ? VotingEnum.SINGLE_CHOICE
        : isSingleOption
          ? VotingEnum.SINGLE_OPTION
          : VotingEnum.MULTIPLE_OPTIONS;

      const parsedChoices = decodedChoices as SingleChoiceEnum[];
      const parsedChoicesWithId = decodedChoices.map(c => ({
        id: uuidv4(),
        value: c,
      })) as BaseOption[];

      const [startDate, endDate] = await Promise.all([
        getDateFromBlock(Number(event.startTime)),
        getDateFromBlock(Number(event.startTime) + Number(event.voteDuration)),
      ]);

      const base = {
        id: event.proposalId,
        proposer: event.proposer,
        createdAt: startDate,
        startDate,
        endDate,
        votingLimit: event.maxSelection,
        ipfsHash: event.description,
      };

      switch (votingType) {
        case VotingEnum.SINGLE_CHOICE:
          return { votingType, votingOptions: parsedChoices, ...base };
        case VotingEnum.SINGLE_OPTION:
        case VotingEnum.MULTIPLE_OPTIONS:
          return { votingType, votingOptions: parsedChoicesWithId, ...base };
      }
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

export const getBlockFromDate = async (date: Date): Promise<number> => {
  const currentBlock = await thorClient.blocks.getFinalBlockExpanded();
  const currentTimestamp = currentBlock?.timestamp || 0; // in seconds
  const currentBlockNumber = currentBlock?.number || 0; // current block number

  const targetTimestamp = Math.floor(date.getTime() / 1000); // in seconds

  const blocksUntilTarget = Math.floor((targetTimestamp - currentTimestamp) / AVERAGE_BLOCK_TIME);
  return currentBlockNumber + blocksUntilTarget;
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
