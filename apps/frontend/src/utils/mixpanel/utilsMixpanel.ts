import { Dict } from "mixpanel-browser";
import { analytics } from "./mixpanel";

export enum MixPanelEvent {
  USER_CONNECTED = "User Connected", //TODO: add with privi integration
  USER_DISCONNECTED = "User Disconnected", //TODO: add with privi integration

  PROPOSAL_CREATE = "Proposal Create",
  PROPOSAL_CREATED = "Proposal Created",
  PROPOSAL_CREATION_FAILED = "Proposal Creation Failed",
  PROPOSAL_VOTE = "Proposal Vote",
  PROPOSAL_PUBLISH = "Proposal Publishing",
  PROPOSAL_CANCEL = "Proposal Cancel",
  PROPOSAL_UPDATE = "Proposal Update",
  PROPOSAL_DELETE = "Proposal Delete",
}

export type MixPanelProperties = {
  [MixPanelEvent.USER_CONNECTED]: { address: string; walletType: string };
  [MixPanelEvent.USER_DISCONNECTED]: { address: string };

  [MixPanelEvent.PROPOSAL_CREATED]: { proposalId: string; transactionId: string };
  [MixPanelEvent.PROPOSAL_CREATION_FAILED]: { transactionId: string };
  [MixPanelEvent.PROPOSAL_VOTE]: { proposalId: string; vote: string };
  [MixPanelEvent.PROPOSAL_CANCEL]: { proposalId: string };
  [MixPanelEvent.PROPOSAL_UPDATE]: { proposalId: string };
  [MixPanelEvent.PROPOSAL_DELETE]: { proposalId: string };
};

// Type-safe trackEvent function with overloads
export function trackEvent<T extends keyof MixPanelProperties>(event: T, properties: MixPanelProperties[T]): void;
export function trackEvent<T extends Exclude<MixPanelEvent, keyof MixPanelProperties>>(event: T): void;
export function trackEvent<T extends MixPanelEvent>(
  event: T,
  properties?: T extends keyof MixPanelProperties ? MixPanelProperties[T] : never,
) {
  analytics.track(event, properties as Dict);
}
