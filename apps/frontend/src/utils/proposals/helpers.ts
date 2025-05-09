import { ProposalEvent, ProposalState } from "@/types/blockchain";
import { BaseOption, ProposalCardType, ProposalStatus, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import dayjs from "dayjs";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { isArraysEqual } from "../array";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";

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

export const getStatusParProposal = (proposals?: Omit<ProposalCardType, "status">[]) => {
  return proposals?.map(p => ({
    method: "state" as const,
    args: [p.id],
  }));
};

export const fromEventsToProposals = (events: ProposalEvent[]): Omit<ProposalCardType, "status">[] => {
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
      title: "",
      description: [],
      votingQuestion: "",
      startDate: dayjs(event.startTime).toDate(),
      endDate: dayjs(event.startTime).add(Number(event.voteDuration)).toDate(),
      headerImage: {
        type: "image/png",
        name: "mock image",
        size: 1,
        url: "/images/proposal_example.png",
      },
      votingLimit: event.maxSelection,
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
