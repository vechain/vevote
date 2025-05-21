import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { ProposalCardType, VotingEnum } from "@/types/proposal";
import { Delta } from "quill";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export const ProposalContext = createContext<{ proposal: ProposalCardType }>({
  proposal: {
    id: "1",
    votingLimit: 1,
    proposer: "0x",
    createdAt: new Date(),
    headerImage: {
      type: "image/png",
      name: "mock image",
      size: 1,
      url: "",
    },
    status: "upcoming",
    description: new Delta().ops,
    title: "",
    startDate: new Date(),
    endDate: new Date(),
    votingQuestion: "",
    votingType: VotingEnum.SINGLE_CHOICE,
    votingOptions: defaultSingleChoice,
  },
});

export const ProposalProvider = ({ children, proposal }: PropsWithChildren<{ proposal: ProposalCardType }>) => {
  const value = useMemo(() => ({ proposal }), [proposal]);
  return <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>;
};

export const useProposal = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposal must be used within a ProposalProvider");
  }
  return context;
};
