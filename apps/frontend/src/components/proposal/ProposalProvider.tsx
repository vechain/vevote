import { ProposalCardType } from "@/types/proposal";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export const ProposalContext = createContext<{ proposal?: ProposalCardType }>({});

export const ProposalProvider = ({ children, proposal }: PropsWithChildren<{ proposal?: ProposalCardType }>) => {
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
