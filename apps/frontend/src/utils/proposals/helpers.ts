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

export const fromEventsToProposals = (events: ProposalEvent[]): FromEventsToProposalsReturnType => {
  return events.map(event => {
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

    const base = {
      id: event.proposalId,
      proposer: event.proposer,
      createdAt: new Date(),
      startDate: dayjs(Number(event.startTime) * 1000).toDate(),
      endDate: dayjs(Number(event.startTime) * 1000)
        .add(Number(event.voteDuration) * 1000)
        .toDate(),
      votingLimit: event.maxSelection,
      ipfsHash: event.description,
    };

    switch (votingType) {
      case VotingEnum.SINGLE_CHOICE:
        return { votingType, votingOptions: parsedChoices, ...base };
      case VotingEnum.SINGLE_OPTION:
        return { votingType, votingOptions: parsedChoicesWithId, ...base };
      case VotingEnum.MULTIPLE_OPTIONS:
        return { votingType, votingOptions: parsedChoicesWithId, ...base };
    }
  });
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

export const fromStringToUint256 = (str: string) => {
  const hexString = BigInt(str).toString(16);
  return HexUInt.of("0x" + hexString).toString();
};
