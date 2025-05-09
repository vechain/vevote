import { ProposalEvent } from "@/types/blockchain";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { getAllEvents } from "@vechain/vechain-kit";
import { buildFilterCriteria, getEventMethods } from "../contract";
import { ProposalCardType } from "@/types/proposal";
import { fromEventsToProposals } from "./helpers";

const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const getProposalsEvents = async (
  thor: Connex.Thor,
): Promise<{ proposals?: Omit<ProposalCardType, "status">[] }> => {
  try {
    const [proposalCreatedEvent, proposalExecutedEvent, proposalCanceledEvent] = getEventMethods({
      contractInterface,
      methods: ["VeVoteProposalCreated", "VeVoteProposalExecuted", "ProposalCanceled"],
    });

    const filterCriteria = buildFilterCriteria({
      contractAddress,
      events: [proposalCreatedEvent, proposalExecutedEvent, proposalCanceledEvent],
    });

    const events: Connex.Thor.Filter.Row<"event", object>[] = await getAllEvents({ thor, nodeUrl, filterCriteria });

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
            startTime: decoded.startTime,
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

    return { proposals: fromEventsToProposals(decodedProposalEvents) };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
