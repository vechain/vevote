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
  votingQuestion: string;
} & VotingChoices;

export const DEFAULT_PROPOSAL: ProposalDetails = {
  title: "",
  description: [],
  votingQuestion: "",
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
  removeDraftProposal: () => void;
  draftProposal: ProposalCardType | null;
};

export const CreateProposalContext = createContext<CreateProposalContextType>({
  proposalDetails: DEFAULT_PROPOSAL,
  setProposalDetails: () => {},
  step: CreateProposalStep.VOTING_DETAILS,
  setStep: () => {},
  saveDraftProposal: async () => {},
  removeDraftProposal: () => {},
  draftProposal: null,
});

export const CreateProposalProvider = ({ children }: PropsWithChildren) => {
  const { fromProposalToDraft } = useDraftProposal();
  const [draftProposal, setDraftProposal, removeDraftProposal] = useLocalStorage<ProposalCardType | null>(
    "draft-proposal",
    null,
  );
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails>(DEFAULT_PROPOSAL);
  const [step, setStep] = useState<CreateProposalStep>(CreateProposalStep.VOTING_DETAILS);

  const saveDraftProposal = useCallback(async () => {
    const draft = await fromProposalToDraft(proposalDetails);
    return setDraftProposal(draft);
  }, [fromProposalToDraft, proposalDetails, setDraftProposal]);

  const value = useMemo(
    () => ({
      proposalDetails,
      setProposalDetails,
      step,
      setStep,
      draftProposal,
      saveDraftProposal,
      removeDraftProposal,
    }),
    [proposalDetails, step, saveDraftProposal, draftProposal, removeDraftProposal],
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
