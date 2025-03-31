import { ProposalCardType } from "@/types/proposal";

export const mockProposals: ProposalCardType[] = [
  {
    isVoted: true,
    status: "voting",
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date("2025-03-29T20:24:00"),
  },
  {
    isVoted: false,
    status: "upcoming",
    title: "Upcoming Proposal: Galactica Launch & Governance Upgrade",
    startDate: new Date("2025-05-10T03:24:00"),
  },
  {
    isVoted: true,
    status: "approved",
    title: "Approved Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date("2025-08-20T03:24:00"),
  },
  {
    isVoted: true,
    status: "executed",
    title: "Executed Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date("2025-07-05T03:12:00"),
  },
  {
    isVoted: true,
    status: "rejected",
    title: "Rejected Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date(),
  },
  {
    isVoted: false,
    status: "canceled",
    title: "Canceled Proposal: Galactica Launch",
  },
];
