import { ProposalStatus, ProposalCardType, ProposalEvent, ProposalState, SingleChoiceEnum } from "@/types/proposal";
import dayjs from "dayjs";
import { Delta } from "quill";
import { IpfsDetails } from "@/types/ipfs";
import { HexUInt } from "@vechain/sdk-core";
import { thorClient } from "../thorClient";
import { ThorClient, vnsUtils } from "@vechain/sdk-network";
import { getConfig } from "@repo/config";
import { HistoricalProposalData, HistoricalProposalMerged } from "@/types/historicalProposals";
import { getProposalsFromIpfs } from "../ipfs/proposal";

const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;

const AVERAGE_BLOCK_TIME = 10; // in seconds

export type FromEventsToProposalsReturnType = ({ ipfsHash: string } & Omit<
  ProposalCardType,
  | "status"
  | "description"
  | "title"
  | "votingQuestion"
  | "headerImage"
  | "canceledDate"
  | "executedDate"
  | "discourseUrl"
>)[];

export const getStatusFromState = (state: ProposalState): ProposalStatus => {
  switch (state) {
    case ProposalState.PENDING:
      return ProposalStatus.UPCOMING;
    case ProposalState.DEFEATED:
      return ProposalStatus.MIN_NOT_REACHED;
    case ProposalState.ACTIVE:
      return ProposalStatus.VOTING;
    case ProposalState.CANCELED:
      return ProposalStatus.CANCELED;
    case ProposalState.EXECUTED:
      return ProposalStatus.EXECUTED;
    case ProposalState.SUCCEEDED:
      return ProposalStatus.APPROVED;
    default:
      return ProposalStatus.UPCOMING;
  }
};

export const getStatusParProposalMethod = (proposalIds?: string[]) => {
  return proposalIds?.map(id => ({
    method: "state" as const,
    args: [id],
  }));
};

export const calculateNextStateChangeTime = (proposals: ProposalCardType[]): number | null => {
  const now = dayjs().valueOf();
  let nextChangeTime: number | null = null;

  for (const proposal of proposals) {
    let proposalNextChange: number | null = null;

    if (proposal.status === ProposalStatus.UPCOMING && proposal.startDate) {
      proposalNextChange = dayjs(proposal.startDate).valueOf();
    } else if (proposal.status === ProposalStatus.VOTING && proposal.endDate) {
      proposalNextChange = dayjs(proposal.endDate).valueOf();
    }

    if (proposalNextChange && proposalNextChange > now) {
      if (!nextChangeTime || proposalNextChange < nextChangeTime) {
        nextChangeTime = proposalNextChange;
      }
    }
  }

  return nextChangeTime;
};

export const calculateRefetchInterval = (proposals: ProposalCardType[]): number | false => {
  const nextChangeTime = calculateNextStateChangeTime(proposals);

  if (!nextChangeTime) return false;

  const now = dayjs().valueOf();
  const timeUntilChange = nextChangeTime - now;

  let interval: number;

  const tenSeconds = 10 * 1000;
  const thirtySeconds = 30 * 1000;
  const oneMinute = 60 * 1000;
  const fiveMinutes = 5 * oneMinute;

  if (timeUntilChange <= oneMinute) {
    interval = tenSeconds;
  } else if (timeUntilChange <= fiveMinutes) {
    interval = thirtySeconds;
  } else {
    interval = oneMinute;
  }

  return interval;
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
  switch (index) {
    case 0:
      return SingleChoiceEnum.AGAINST;
    case 1:
      return SingleChoiceEnum.FOR;
    case 2:
      return SingleChoiceEnum.ABSTAIN;
    default:
      throw new Error(`Invalid index: ${index}`);
  }
};

export const filterStatus = (statuses: ProposalStatus[], status: ProposalStatus): boolean => {
  return statuses.includes(status);
};

export const fromEventsToProposals = async (events: ProposalEvent[]): Promise<FromEventsToProposalsReturnType> => {
  return await Promise.all(
    events.map(async event => {
      const [createdDate, startDate, endDate, canceledDate, executedDate] = await Promise.all([
        new Date(event.createdTime || 0),
        getDateFromBlock(Number(event.startTime)),
        getDateFromBlock(Number(event.startTime) + Number(event.voteDuration)),
        new Date(event.canceledTime || 0),
        event.executedTime ? new Date(event.executedTime) : undefined,
      ]);
      return {
        id: event.proposalId,
        proposer: event.proposer,
        createdAt: createdDate,
        startDate,
        endDate,
        canceledDate,
        executedDate,
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
      discourseUrl: currentIpfsProposal?.discourseUrl || "",
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

export const getVetDomainOrAddresses = async (addresses: string[]) => {
  const thor = ThorClient.at(nodeUrl);
  const domains = await vnsUtils.lookupAddresses(thor, addresses);
  return domains.map((domain, index) => {
    return {
      address: addresses[index],
      domain,
    };
  });
};

export const parseHistoricalProposals = async (
  data?: HistoricalProposalData[],
): Promise<HistoricalProposalMerged[]> => {
  if (!data) return [];
  const ipfsFetches = data.map(d => getProposalsFromIpfs(d.description));

  const ipfsDetails = await Promise.all(ipfsFetches);

  return data.map(d => {
    const choicesWithVote = d.choices.map((choice, index) => ({
      choice,
      votes: d.voteTallies[index],
      percentage: d.totalVotes ? (d.voteTallies[index] / d.totalVotes) * 100 : 0,
    }));

    const createdAt = dayjs.unix(Number(d.createdDate)).toDate();

    return {
      id: d.proposalId,
      proposer: d.proposer,
      createdAt,
      startDate: dayjs.unix(d.votingStartTime).toDate(),
      endDate: dayjs.unix(d.votingEndTime).toDate(),
      description: new Delta(ipfsDetails.find(ipfs => ipfs?.ipfsHash === d.description)?.markdownDescription || []).ops,
      title: d.title,
      votingQuestion: "",
      status: d.totalVotes === 0 ? ProposalStatus.MIN_NOT_REACHED : ProposalStatus.EXECUTED,
      choicesWithVote,
      totalVotes: d.totalVotes,
      ipfsHash: "",
    };
  });
};

export const formatVotingPower = (power: bigint): string => {
  return (Number(power) / 100).toString();
};
