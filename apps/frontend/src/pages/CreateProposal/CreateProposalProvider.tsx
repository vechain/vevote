import { useDraftProposal } from "@/hooks/useDraftProposal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CreateProposalStep, ProposalCardType, SingleChoiceEnum, VotingChoices, VotingEnum } from "@/types/proposal";
import { ZodFile } from "@/utils/zod";
import { Op } from "quill";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
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

export type ProposalDescription = Op;

export type ProposalDetails = {
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
  saveDraftProposal: () => Promise<void>;
  draftProposal: ProposalCardType | null;
};

export const CreateProposalContext = createContext<CreateProposalContextType>({
  proposalDetails: DEFAULT_PROPOSAL,
  setProposalDetails: () => {},
  step: CreateProposalStep.VOTING_DETAILS,
  setStep: () => {},
  saveDraftProposal: async () => {},
  draftProposal: null,
});

export const CreateProposalProvider = ({ children }: PropsWithChildren) => {
  const { fromDraftToProposal, fromProposalToDraft } = useDraftProposal();
  const [draftProposal, setDraftProposal] = useLocalStorage<ProposalCardType | null>("draft-proposal", null);
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails>(
    fromDraftToProposal(draftProposal, DEFAULT_PROPOSAL),
  );
  const [step, setStep] = useState<CreateProposalStep>(CreateProposalStep.VOTING_DETAILS);

  const saveDraftProposal = useCallback(async () => {
    const draft = await fromProposalToDraft(proposalDetails);
    return setDraftProposal(draft);
  }, [fromProposalToDraft, proposalDetails, setDraftProposal]);

  const value = useMemo(
    () => ({ proposalDetails, setProposalDetails, step, setStep, draftProposal, saveDraftProposal }),
    [proposalDetails, step, saveDraftProposal, draftProposal],
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
