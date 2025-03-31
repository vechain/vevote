import type { BaseTranslation } from "../i18n-types.js";

const en = {
  start: "Start",
  end: "End",
  all: "All",
  finished: "Finished",
  show_more: "Show more",
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
