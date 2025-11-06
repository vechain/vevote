import { BaseWebSocket } from "./BaseWebSocket";

type SimpleEventCallback = () => void;

export class VoteCastWebSocket extends BaseWebSocket {
  constructor() {
    super("VoteCast");
  }

  onInvalidateVoteCast(callback: SimpleEventCallback): () => void {
    return this.onEvent(callback);
  }

  protected getEventName(): string {
    return "VoteCast";
  }
}
