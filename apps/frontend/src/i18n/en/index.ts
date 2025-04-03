import type { BaseTranslation } from "../i18n-types.js";

const en = {
  homepage: "Homepage",
  back: "Back",
  start: "Start",
  end: "End",
  on: "On",
  all: "All",
  finished: "Finished",
  show_more: "Show more",
  exit: "Exit",
  next: "Next",
  learn_more: "Learn more",
  see_details: "See details",
  home: {
    title: "Home",
    go_to_proposals: "Go to proposals",
  },
  field_errors: {
    required: "Required",
  },
  proposal: {
    title: "Proposal",
    proposed_by: "Proposed by",
    voting_calendar: "Voting calendar",
    who_can_vote: "Who can vote",
    vechain_foundation: "VeChain Foundation",
    node_holders: "Node holders with voting power will be able to vote on this proposal.",
    create: {
      title: "Create Proposal",
      steps: "{current:number} of {total:number}",
      voting_details_desc: "Add the main details and setup the calendar",
      voting_setup_desc: "Define the voting setup details",
      voting_summary_desc: "Review all the details before publishing",
    },
  },
  proposals: {
    title: "Proposals",
    create: "Create Proposal",
    search_placeholder: "Search proposals...",
    no_proposals: "No proposals found",
    pagination: "{current:number} of {total:number} proposals",
  },
  statuses: {
    voted: "Voted",
  },
  badge: {
    draft: "Draft",
    upcoming: "Upcoming",
    voting: "Voting now",
    approved: "Approved",
    executed: "Executed",
    canceled: "Canceled",
    rejected: "Rejected",
  },
  filters: {
    sort: {
      newest: "Newest",
      oldest: "Oldest",
      most_participant: "Most participant",
      least_participant: "Least participant",
    },
  },
  header: {
    official: "Official",
    blockchain: "VeChainThor Blockchain",
    voting_platform: "voting platform",
    immutable: "Immutable.",
    transparent: "Transparent.",
    decentralized: "Decentralized.",
  },
  footer: {
    all_right: "All Rights Reserved © Vechain Foundation San Marino S.r.l.",
    legal: {
      terms_of_service: "Terms of Service",
      privacy_policy: "Privacy Policy",
      cookies_policy: "Cookies Policy",
    },
  },
} satisfies BaseTranslation;

export default en;
