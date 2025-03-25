import type { BaseTranslation } from "../i18n-types.js";

const en = {
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
} satisfies BaseTranslation;

export default en;
