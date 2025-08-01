import { ProposalCardType, ProposalStatus } from "@/types/proposal";
import { Delta } from "quill";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

const DEFAULT_PROPOSAL = {
  id: "default",
  proposer: "0x",
  createdAt: new Date(),
  headerImage: {
    type: "image/png",
    name: "mock image",
    size: 1,
    url: "",
  },
  status: ProposalStatus.UPCOMING,
  description: new Delta().ops,
  title: "",
  startDate: new Date(),
  endDate: new Date(),
  votingQuestion: "",
};

export const ProposalContext = createContext<{ proposal: ProposalCardType }>({
  proposal: DEFAULT_PROPOSAL,
});

export const ProposalProvider = ({ children, proposal }: PropsWithChildren<{ proposal?: ProposalCardType }>) => {
  const value = useMemo(() => ({ proposal: proposal || DEFAULT_PROPOSAL }), [proposal]);
  return <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>;
};

export const useProposal = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposal must be used within a ProposalProvider");
  }
  return context;
};
