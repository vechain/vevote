import { ProposalCardType, VotingEnum } from "@/types/proposal";
import { defaultSingleChoice } from "@/utils/mock";
import { createContext, PropsWithChildren, useContext } from "react";

export const ProposalContext = createContext<{ proposal: ProposalCardType }>({
  proposal: {
    id: "1",
    maxSelection: 1,
    proposer: "0x",
    createdAt: new Date(),
    headerImage: "/images/proposal_example.png",
    status: "upcoming",
    description: "",
    title: "",
    startDate: new Date(),
    endDate: new Date(),
    question: "",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
});

export const ProposalProvider = ({ children, proposal }: PropsWithChildren<{ proposal: ProposalCardType }>) => {
  return <ProposalContext.Provider value={{ proposal }}>{children}</ProposalContext.Provider>;
};

export const useProposal = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposal must be used within a ProposalProvider");
  }
  return context;
};
