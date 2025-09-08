/* eslint-disable @typescript-eslint/no-explicit-any */
import { subscriptions } from "@vechain/sdk-network";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { thorClient } from "@/utils/thorClient";
import { ABIEvent } from "@vechain/sdk-core";

type SimpleEventCallback = () => void;

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;

export abstract class BaseWebSocket {
  private ws: WebSocket | null = null;
  private simpleCallbacks = new Set<SimpleEventCallback>();
  protected config = getConfig(import.meta.env.VITE_APP_ENV);
  protected eventAbi: ABIEvent;

  constructor(eventName: string) {
    this.eventAbi = thorClient.contracts.load(contractAddress, VeVote__factory.abi).getEventAbi(eventName) as any;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = subscriptions.getEventSubscriptionUrl(
        this.config.nodeUrl,
        JSON.parse(this.eventAbi.format("json")),
        [],
        {
          address: this.config.vevoteContractAddress,
        },
      );

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {};

      this.ws.onmessage = event => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {};

      this.ws.onerror = () => {};
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.ws = null;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onEvent(callback: SimpleEventCallback): () => void {
    this.simpleCallbacks.add(callback);
    return () => this.simpleCallbacks.delete(callback);
  }

  private handleMessage(rawData: string): void {
    try {
      const data = JSON.parse(rawData);

      if (data.topics && data.topics[0] === this.eventAbi.signatureHash) {
        this.simpleCallbacks.forEach(callback => {
          callback();
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  protected abstract getEventName(): string;
}
