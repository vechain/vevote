import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { ProposalEvent } from "@/types/blockchain";
import { BaseOption, ProposalCardType, VotingEnum } from "@/types/proposal";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { getAllEventLogs, ThorClient } from "@vechain/vechain-kit";
import { ethers } from "ethers";
import { executeCall, executeMultipleClauses } from "../contract";
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
  thor: ThorClient,
  proposalId?: string,
): Promise<{ proposals: FromEventsToProposalsReturnType }> => {
  try {
    // Get event ABIs
    const proposalCreatedEventAbi = thor.contracts.load(contractAddress, VeVote__factory.abi).getEventAbi("VeVoteProposalCreated");
    const proposalExecutedEventAbi = thor.contracts.load(contractAddress, VeVote__factory.abi).getEventAbi("VeVoteProposalExecuted");
    const proposalCanceledEventAbi = thor.contracts.load(contractAddress, VeVote__factory.abi).getEventAbi("ProposalCanceled");

    // Build filter criteria
    const filterCriteria = [
      {
        criteria: {
          address: contractAddress,
          topic0: proposalCreatedEventAbi.stringSignature,
          topic1: proposalId ? proposalCreatedEventAbi.encodeFilterTopicsNoNull({ proposalId })[1] : undefined,
        },
        eventAbi: proposalCreatedEventAbi,
      },
      {
        criteria: {
          address: contractAddress,
          topic0: proposalExecutedEventAbi.stringSignature,
          topic1: proposalId ? proposalExecutedEventAbi.encodeFilterTopicsNoNull({ proposalId })[1] : undefined,
        },
        eventAbi: proposalExecutedEventAbi,
      },
      {
        criteria: {
          address: contractAddress,
          topic0: proposalCanceledEventAbi.stringSignature,
          topic1: proposalId ? proposalCanceledEventAbi.encodeFilterTopicsNoNull({ proposalId })[1] : undefined,
        },
        eventAbi: proposalCanceledEventAbi,
      },
    ];

    // Fetch all events
    const events = await getAllEventLogs({ thor, nodeUrl, filterCriteria });

    const decodedProposalEvents = events
      .map(event => {
        const eventSignature = event.topics[0];

        if (eventSignature === proposalCreatedEventAbi.stringSignature || eventSignature === proposalExecutedEventAbi.stringSignature) {
          const [proposalId, proposer, description, startBlock, voteDuration, choices, maxSelection] = event.decodedData as [string, string, string, bigint, bigint, string[], bigint];

          return {
            proposalId,
            proposer,
            description,
            startTime: startBlock.toString(),
            voteDuration: voteDuration.toString(),
            choices,
            maxSelection: Number(maxSelection),
            minSelection: 1,
          };
        }

        return undefined;
      })
      .filter(Boolean);

    const decodedCanceledProposals = events
      .map(event => {
        if (event.topics[0] === proposalCanceledEventAbi.stringSignature) {
          const [proposalId, canceller, reason] = event.decodedData as [string, string, string];

          return {
            proposalId,
            canceller,
            reason: reason || "",
          };
        }

        return undefined;
      })
      .filter(Boolean);

    const mergedProposals: ProposalEvent[] = decodedProposalEvents
      .map(proposal => {
        const canceledProposal = decodedCanceledProposals.find(
          canceled => canceled?.proposalId === proposal?.proposalId,
        );

        return canceledProposal
          ? { ...proposal, canceller: canceledProposal.canceller, reason: canceledProposal.reason }
          : proposal;
      })
      .filter(Boolean) as ProposalEvent[];

    const proposals = await fromEventsToProposals(mergedProposals);

    return { proposals };
  } catch (error) {
    console.error("Error fetching proposal events:", error);
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

  return {
    minVotingDelay: Number(clock[0].result.plain) * 10,
    maxVotingDuration: Number(clock[1].result.plain) * 10,
  };
};
