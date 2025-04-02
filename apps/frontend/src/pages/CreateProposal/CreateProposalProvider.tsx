import { CreateProposalStep, VotingChoices } from "@/types/proposal";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";

type ProposalDetails = {
  title: string;
  description: string;
  headerImage: File | null;
  startDate: Date;
  endDate: Date;
  minParticipant: `${number}%`;
  question: string;
} & VotingChoices;

export type CreateProposalContextType = {
  step: CreateProposalStep;
  setStep: Dispatch<SetStateAction<CreateProposalStep>>;
  proposalDetails?: ProposalDetails;
  setProposalDetails: Dispatch<SetStateAction<ProposalDetails | undefined>>;
};

export const CreateProposalContext = createContext<CreateProposalContextType>({
  setProposalDetails: () => {},
  step: CreateProposalStep.VOTING_DETAILS,
  setStep: () => {},
});

export const CreateProposalProvider = ({ children }: PropsWithChildren) => {
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails | undefined>();
  const [step, setStep] = useState<CreateProposalStep>(CreateProposalStep.VOTING_DETAILS);

  const value = useMemo(
    () => ({ proposalDetails, setProposalDetails, step, setStep }),
    [proposalDetails, setProposalDetails, step, setStep],
  );

  return <CreateProposalContext.Provider value={value}>{children}</CreateProposalContext.Provider>;
};

export const useCreateProposal = () => {
  const context = useContext(CreateProposalContext);
  if (!context) {
    throw new Error("useCreateProposal must be used within a CreateProposalProvider");
  }
  return context;
};
