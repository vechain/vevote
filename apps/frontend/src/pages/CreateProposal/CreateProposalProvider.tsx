import { CreateProposalStep, SingleChoiceEnum, VotingChoices, VotingEnum } from "@/types/proposal";
import { ZodFile } from "@/utils/zod";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const defaultSingleChoice = [SingleChoiceEnum.YES, SingleChoiceEnum.NO, SingleChoiceEnum.ABSTAIN];
export const defaultMultiOptionsChoice = [
  {
    id: uuidv4(),
    value: "",
  },
  {
    id: uuidv4(),
    value: "",
  },
];

export type ProposalDescription = Record<string, string | Record<string, string>>;

type ProposalDetails = {
  title: string;
  description: ProposalDescription[];
  headerImage?: ZodFile;
  startDate?: Date;
  endDate?: Date;
  votingLimit?: number;
  question: string;
} & VotingChoices;

const DEFAULT_PROPOSAL: ProposalDetails = {
  title: "",
  description: [],
  question: "",
  votingLimit: 1,
  votingType: VotingEnum.SINGLE_CHOICE,
  votingOptions: defaultSingleChoice,
};

export type CreateProposalContextType = {
  step: CreateProposalStep;
  setStep: Dispatch<SetStateAction<CreateProposalStep>>;
  proposalDetails: ProposalDetails;
  setProposalDetails: Dispatch<SetStateAction<ProposalDetails>>;
};

export const CreateProposalContext = createContext<CreateProposalContextType>({
  proposalDetails: DEFAULT_PROPOSAL,
  setProposalDetails: () => {},
  step: CreateProposalStep.VOTING_DETAILS,
  setStep: () => {},
});

export const CreateProposalProvider = ({ children }: PropsWithChildren) => {
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails>(DEFAULT_PROPOSAL);
  const [step, setStep] = useState<CreateProposalStep>(CreateProposalStep.VOTING_SETUP); //todo: re-default to details step

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
