import { defaultSingleChoice } from "@/components/proposal/ProposalProvider";
import { ProposalCardType, VotingEnum } from "@/types/proposal";
import dayjs from "dayjs";
import { Delta } from "quill";

const mockDesc = new Delta([
  {
    attributes: {
      bold: true,
    },
    insert: "Galactica ",
  },
  {
    insert:
      "is the first of three stages of the VeChain Renaissance - a revolutionary technical roadmap and generational leap for the protocol. Galactica begins a process that will ultimately upgrade VeChainThor’s tokenomic, governance and technical capabilities, placing community at the core and tying rewards to network contributions.\n(To review technical changes, including the massive upgrades to VeChain’s tokenomic model, see our recent release ",
  },
  {
    attributes: {
      link: "www.google.com",
    },
    insert: "here",
  },
  {
    insert: ").\n",
  },
]);

export const mockProposals: ProposalCardType[] = [
  {
    id: "1",
    proposer: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date("2025-01-01T00:00:00"),
    headerImage: {
      type: "image/png",
      name: "mock image",
      size: 1,
      url: "/images/proposal_example.png",
    },
    status: "voting",
    description: mockDesc.ops,
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    startDate: dayjs().subtract(1, "day").toDate(),
    endDate: dayjs().add(5, "day").toDate(),
    votingQuestion: "Do you agree with the voting proposal Galactica launch & Governance upgrade?",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
  {
    id: "4",
    proposer: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date("2025-01-01T00:00:00"),
    headerImage: {
      type: "image/png",
      name: "mock image",
      size: 1,
      url: "/images/proposal_example.png",
    },
    status: "executed",
    description: mockDesc.ops,
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    startDate: dayjs().subtract(4, "day").toDate(),
    endDate: dayjs().subtract(3, "day").toDate(),
    votingQuestion: "Do you agree with the voting proposal Galactica launch & Governance upgrade?",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
  {
    id: "5",
    proposer: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date("2025-01-01T00:00:00"),
    headerImage: {
      type: "image/png",
      name: "mock image",
      size: 1,
      url: "/images/proposal_example.png",
    },
    status: "rejected",
    description: mockDesc.ops,
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    startDate: dayjs().subtract(4, "day").toDate(),
    endDate: dayjs().subtract(3, "day").toDate(),
    votingQuestion: "Do you agree with the voting proposal Galactica launch & Governance upgrade?",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
  {
    id: "6",
    proposer: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date("2025-01-01T00:00:00"),
    headerImage: {
      type: "image/png",
      name: "mock image",
      size: 1,
      url: "/images/proposal_example.png",
    },
    status: "canceled",
    description: mockDesc.ops,
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    endDate: dayjs().subtract(3, "day").toDate(),
    startDate: dayjs().subtract(3, "day").toDate(),
    votingQuestion: "Do you agree with the voting proposal Galactica launch & Governance upgrade?",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
  {
    id: "8",
    proposer: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date("2025-01-01T00:00:00"),
    headerImage: {
      type: "image/png",
      name: "mock image",
      size: 1,
      url: "/images/proposal_example.png",
    },
    status: "min-not-reached",
    description: mockDesc.ops,
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    endDate: dayjs().subtract(3, "day").toDate(),
    startDate: dayjs().subtract(3, "day").toDate(),
    votingQuestion: "Do you agree with the voting proposal Galactica launch & Governance upgrade?",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
  {
    id: "9",
    proposer: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date("2025-01-01T00:00:00"),
    headerImage: {
      type: "image/png",
      name: "mock image",
      size: 1,
      url: "/images/proposal_example.png",
    },
    status: "approved",
    description: mockDesc.ops,
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    startDate: dayjs().subtract(4, "day").toDate(),
    endDate: dayjs().subtract(3, "day").toDate(),
    votingQuestion: "Do you agree with the voting proposal Galactica launch & Governance upgrade?",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
];
