import { Dict } from "mixpanel-browser";
import { analytics } from "./mixpanel";

export enum MixPanelEvent {
  USER_CONNECTED = "User Connected",
  USER_DISCONNECTED = "User Disconnected",

  PROPOSAL_PUBLISH = "Proposal Publishing",
  PROPOSAL_PUBLISHED = "Proposal Published",
  PROPOSAL_PUBLISH_FAILED = "Proposal Publish Failed",

  PROPOSAL_VOTE = "Proposal Vote Initiated",
  PROPOSAL_VOTE_SUCCESS = "Proposal Vote Success",
  PROPOSAL_VOTE_FAILED = "Proposal Vote Failed",

  PROPOSAL_CANCEL = "Proposal Cancel Initiated",
  PROPOSAL_CANCEL_SUCCESS = "Proposal Cancel Success",
  PROPOSAL_CANCEL_FAILED = "Proposal Cancel Failed",

  CTA_CREATE_PROPOSAL_CLICKED = "CTA Create Proposal Clicked",
  CTA_VOTE_CLICKED = "CTA Vote Clicked",
  CTA_PUBLISH_CLICKED = "CTA Publish Clicked",
  CTA_CANCEL_CLICKED = "CTA Cancel Clicked",
  CTA_EDIT_CLICKED = "CTA Edit Clicked",
  CTA_DELETE_CLICKED = "CTA Delete Clicked",
  CTA_PROPOSAL_CARD_CLICKED = "CTA Proposal Card Clicked",
}

export type MixPanelProperties = {
  [MixPanelEvent.USER_CONNECTED]: { address: string; walletType: string; isInAppBrowser?: boolean };
  [MixPanelEvent.USER_DISCONNECTED]: { address: string };

  [MixPanelEvent.PROPOSAL_PUBLISHED]: { proposalId: string; transactionId: string };
  [MixPanelEvent.PROPOSAL_PUBLISH_FAILED]: { proposalId: string; error: string; transactionId?: string };

  [MixPanelEvent.PROPOSAL_VOTE]: { proposalId: string; vote: string; reason?: string };
  [MixPanelEvent.PROPOSAL_VOTE_SUCCESS]: { proposalId: string; vote: string; transactionId: string; reason?: string };
  [MixPanelEvent.PROPOSAL_VOTE_FAILED]: { proposalId: string; vote: string; error: string; transactionId?: string; reason?: string };

  [MixPanelEvent.PROPOSAL_CANCEL]: { proposalId: string };
  [MixPanelEvent.PROPOSAL_CANCEL_SUCCESS]: { proposalId: string; transactionId: string };
  [MixPanelEvent.PROPOSAL_CANCEL_FAILED]: { proposalId: string; error: string; transactionId?: string };

  [MixPanelEvent.CTA_CREATE_PROPOSAL_CLICKED]: { page: string };
  [MixPanelEvent.CTA_VOTE_CLICKED]: { proposalId: string; voteOption: string; reason?: string };
  [MixPanelEvent.CTA_PUBLISH_CLICKED]: { proposalId: string };
  [MixPanelEvent.CTA_CANCEL_CLICKED]: { proposalId: string };
  [MixPanelEvent.CTA_EDIT_CLICKED]: { proposalId: string };
  [MixPanelEvent.CTA_DELETE_CLICKED]: { proposalId: string };
  [MixPanelEvent.CTA_PROPOSAL_CARD_CLICKED]: { proposalId: string };
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
