import { Dict } from "mixpanel-browser";
import { analytics } from "./mixpanel";

export enum MixPanelEvent {
  USER_CONNECTED = "User Connected", //TODO: add with privi integration
  USER_DISCONNECTED = "User Disconnected", //TODO: add with privi integration

  PROPOSAL_CREATE = "Proposal Create",
  PROPOSAL_CREATED = "Proposal Created",
  PROPOSAL_CREATION_FAILED = "Proposal Creation Failed",

  PROPOSAL_PUBLISH = "Proposal Publishing",
  PROPOSAL_PUBLISHED = "Proposal Published",
  PROPOSAL_PUBLISH_FAILED = "Proposal Publish Failed",

  PROPOSAL_VOTE = "Proposal Vote",
  PROPOSAL_VOTE_SUCCESS = "Proposal Vote Success",
  PROPOSAL_VOTE_FAILED = "Proposal Vote Failed",

  PROPOSAL_CANCEL = "Proposal Cancel",
  PROPOSAL_CANCEL_SUCCESS = "Proposal Cancel Success",
  PROPOSAL_CANCEL_FAILED = "Proposal Cancel Failed",

  PROPOSAL_UPDATE = "Proposal Update",
  PROPOSAL_UPDATE_SUCCESS = "Proposal Update Success",
  PROPOSAL_UPDATE_FAILED = "Proposal Update Failed",

  PROPOSAL_DELETE = "Proposal Delete",
  PROPOSAL_DELETE_SUCCESS = "Proposal Delete Success",
  PROPOSAL_DELETE_FAILED = "Proposal Delete Failed",

  // Call-to-action events
  CTA_CREATE_PROPOSAL_CLICKED = "CTA Create Proposal Clicked",
  CTA_VOTE_CLICKED = "CTA Vote Clicked",
  CTA_PUBLISH_CLICKED = "CTA Publish Clicked",
  CTA_CANCEL_CLICKED = "CTA Cancel Clicked",
  CTA_EDIT_CLICKED = "CTA Edit Clicked",
  CTA_DELETE_CLICKED = "CTA Delete Clicked",
}

export type MixPanelProperties = {
  [MixPanelEvent.USER_CONNECTED]: { address: string; walletType: string };
  [MixPanelEvent.USER_DISCONNECTED]: { address: string };

  [MixPanelEvent.PROPOSAL_CREATED]: { proposalId: string; transactionId: string };
  [MixPanelEvent.PROPOSAL_CREATION_FAILED]: { error: string; transactionId?: string };

  [MixPanelEvent.PROPOSAL_PUBLISHED]: { proposalId: string; transactionId: string };
  [MixPanelEvent.PROPOSAL_PUBLISH_FAILED]: { proposalId: string; error: string; transactionId?: string };

  [MixPanelEvent.PROPOSAL_VOTE]: { proposalId: string; vote: string };
  [MixPanelEvent.PROPOSAL_VOTE_SUCCESS]: { proposalId: string; vote: string; transactionId: string };
  [MixPanelEvent.PROPOSAL_VOTE_FAILED]: { proposalId: string; vote: string; error: string; transactionId?: string };

  [MixPanelEvent.PROPOSAL_CANCEL]: { proposalId: string };
  [MixPanelEvent.PROPOSAL_CANCEL_SUCCESS]: { proposalId: string; transactionId: string };
  [MixPanelEvent.PROPOSAL_CANCEL_FAILED]: { proposalId: string; error: string; transactionId?: string };

  [MixPanelEvent.PROPOSAL_UPDATE]: { proposalId: string };
  [MixPanelEvent.PROPOSAL_UPDATE_SUCCESS]: { proposalId: string; transactionId?: string };
  [MixPanelEvent.PROPOSAL_UPDATE_FAILED]: { proposalId: string; error: string };

  [MixPanelEvent.PROPOSAL_DELETE]: { proposalId: string };
  [MixPanelEvent.PROPOSAL_DELETE_SUCCESS]: { proposalId: string };
  [MixPanelEvent.PROPOSAL_DELETE_FAILED]: { proposalId: string; error: string };

  [MixPanelEvent.CTA_CREATE_PROPOSAL_CLICKED]: { page: string };
  [MixPanelEvent.CTA_VOTE_CLICKED]: { proposalId: string; voteOption: string };
  [MixPanelEvent.CTA_PUBLISH_CLICKED]: { proposalId: string };
  [MixPanelEvent.CTA_CANCEL_CLICKED]: { proposalId: string };
  [MixPanelEvent.CTA_EDIT_CLICKED]: { proposalId: string };
  [MixPanelEvent.CTA_DELETE_CLICKED]: { proposalId: string };
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
