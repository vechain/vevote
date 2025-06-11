import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { ProposalEvent } from "@/types/blockchain";
import { BaseOption, ProposalCardType, VotingEnum } from "@/types/proposal";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { getAllEvents } from "@vechain/vechain-kit";
import { ethers } from "ethers";
import { buildFilterCriteria, executeCall, executeMultipleClauses, getEventMethods } from "../contract";
import {
  fromEventsToProposals,
  FromEventsToProposalsReturnType,
  getStatusFromState,
  getStatusParProposalMethod,
} from "./helpers";

const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const getProposalsEvents = async (
  thor: Connex.Thor,
  proposalId?: string,
): Promise<{ proposals: FromEventsToProposalsReturnType }> => {
  try {
    const [proposalCreatedEvent, proposalExecutedEvent, proposalCanceledEvent] = getEventMethods({
      contractInterface,
      methods: ["VeVoteProposalCreated", "VeVoteProposalExecuted", "ProposalCanceled"],
    });

    const filterCriteria = buildFilterCriteria({
      contractAddress,
      events: [proposalCreatedEvent, proposalExecutedEvent, proposalCanceledEvent],
      proposalId,
    });

    const events: Connex.Thor.Filter.Row<"event", object>[] = await getAllEvents({ thor, nodeUrl, filterCriteria });
    //TODO: use sdk once vechain-kit is compatible
    // const events = subscriptions.getEventSubscriptionUrl(nodeUrl)

    const decodedProposalEvents: ProposalEvent[] = events.map(event => {
      switch (event.topics[0]) {
        case proposalCanceledEvent.signature:
        case proposalExecutedEvent.signature:
        case proposalCreatedEvent.signature: {
          const decoded = proposalCreatedEvent.decode(event.data, event.topics);

          const proposalEvent: ProposalEvent = {
            proposalId: decoded.proposalId,
            proposer: decoded.proposer,
            description: decoded.description,
            startTime: decoded.startBlock,
            voteDuration: decoded.voteDuration,
            choices: decoded.choices,
            maxSelection: decoded.maxSelection,
            minSelection: 1,
          };

          return proposalEvent;
        }

        default: {
          throw new Error("Unknown event");
        }
      }
    });

    const partialProposals = await fromEventsToProposals(decodedProposalEvents);

    return { proposals: partialProposals };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getProposalsWithState = async (proposalsData?: Omit<ProposalCardType, "status">[]) => {
  try {
    const proposalsState = await executeMultipleClauses({
      contractAddress,
      contractInterface,
      methodsWithArgs: getStatusParProposalMethod(proposalsData?.map(d => d.id || "")),
    });

    const parsedProposalState = proposalsState?.map(r => {
      return getStatusFromState(Number(r.result.plain));
    });

    return (
      (proposalsData?.map((p, i) => ({
        status: parsedProposalState[i],
        ...p,
      })) as ProposalCardType[]) || []
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getHashProposal = async ({
  description,
  votingOptions,
  votingType,
  durationBlock,
  startBlock,
  votingLimit,
  proposer,
}: Omit<ProposalDetails, "description" | "startTime" | "endTime"> & {
  description: string;
  proposer: string;
  startBlock: number;
  durationBlock: number;
}) => {
  const encodedChoices =
    votingType === VotingEnum.SINGLE_CHOICE
      ? votingOptions.map(c => ethers.encodeBytes32String(c as string))
      : votingOptions.map(c => ethers.encodeBytes32String((c as BaseOption).value));

  const args = [
    proposer,
    startBlock,
    durationBlock - startBlock,
    encodedChoices,
    ethers.keccak256(ethers.toUtf8Bytes(description)),
    votingLimit || 1,
    1,
  ];

  return await executeCall({
    contractAddress,
    contractInterface,
    method: "hashProposal",
    args,
  });
};

export const getProposalClock = async () => {
  const methodsWithArgs = [
    {
      method: "getMinVotingDelay" as const,
      args: [],
    },
    {
      method: "getMaxVotingDuration" as const,
      args: [],
    },
  ];

  const clock = await executeMultipleClauses({
    contractAddress,
    contractInterface,
    methodsWithArgs,
  });

  console.log({
    minVotingDelay: Number(clock[0].result.plain) * 10,
    maxVotingDuration: Number(clock[1].result.plain) * 10,
  });

  return {
    minVotingDelay: Number(clock[0].result.plain) * 10,
    maxVotingDuration: Number(clock[1].result.plain) * 10,
  };
};
