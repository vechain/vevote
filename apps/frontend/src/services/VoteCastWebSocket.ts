import { subscriptions } from "@vechain/sdk-network";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { thorClient } from "@/utils/thorClient";

type SimpleEventCallback = () => void;

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;

export class VoteCastWebSocket {
  private ws: WebSocket | null = null;
  private simpleCallbacks = new Set<SimpleEventCallback>();
  private config = getConfig(import.meta.env.VITE_APP_ENV);
  private voteCastAbi = thorClient.contracts.load(contractAddress, VeVote__factory.abi).getEventAbi("VoteCast");

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("⚠️ WebSocket già connesso");
      return;
    }

    try {
      const wsUrl = subscriptions.getEventSubscriptionUrl(
        this.config.nodeUrl,
        JSON.parse(this.voteCastAbi.format("json")),
        [],
        {
          address: this.config.vevoteContractAddress,
        },
      );

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connesso!");
      };

      this.ws.onmessage = event => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = event => {
        console.log("🚪 WebSocket chiuso:", event.code);
      };

      this.ws.onerror = error => {
        console.error("❌ Errore WebSocket:", error);
      };
    } catch (error) {
      console.error("❌ Errore creazione WebSocket:", error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log("🔌 WebSocket disconnesso");
    }
  }

  onInvalidateVoteCast(callback: SimpleEventCallback): () => void {
    this.simpleCallbacks.add(callback);
    return () => this.simpleCallbacks.delete(callback);
  }

  private handleMessage(rawData: string): void {
    try {
      const data = JSON.parse(rawData);

      if (data.topics && data.topics[0] === this.voteCastAbi.signatureHash) {
        this.simpleCallbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error("❌ Errore in callback:", error);
          }
        });
      }
    } catch (error) {
      console.error("❌ Errore parsing messaggio:", error);
    }
  }
}
