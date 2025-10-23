import { BaseWebSocket } from "./BaseWebSocket";

type SimpleEventCallback = () => void;

export class ProposalCreatedWebSocket extends BaseWebSocket {
  constructor() {
    super("VeVoteProposalCreated");
  }

  onInvalidateProposalCreated(callback: SimpleEventCallback): () => void {
    return this.onEvent(callback);
  }

  protected getEventName(): string {
    return "VeVoteProposalCreated";
  }
}
