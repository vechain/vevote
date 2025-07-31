import { useDraftProposal } from "@/hooks/useDraftProposal";
import { usePerAddressDraftStorage } from "@/hooks/usePerAddressDraftStorage";
import { CreateProposalStep, ProposalCardType, SingleChoiceEnum } from "@/types/proposal";
import { DEFAULT_DESCRIPTION_TEMPLATE } from "@/utils/template/descriptionTemplate";
import { ZodFile } from "@/utils/zod";
import { useWallet } from "@vechain/vechain-kit";
import { Op } from "quill";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const defaultSingleChoice = [SingleChoiceEnum.FOR, SingleChoiceEnum.AGAINST, SingleChoiceEnum.ABSTAIN];

export type ProposalDescription = Op;

export type ProposalDetails = {
  title: string;
  description: ProposalDescription[];
  headerImage?: ZodFile;
  startDate?: Date;
  endDate?: Date;
  votingQuestion: string;
  discourseUrl?: string;
};

export const DEFAULT_PROPOSAL: ProposalDetails = {
  title: "",
  description: DEFAULT_DESCRIPTION_TEMPLATE().ops,
  votingQuestion: "",
  discourseUrl: "",
};

export type CreateProposalContextType = {
  step: CreateProposalStep;
  setStep: Dispatch<SetStateAction<CreateProposalStep>>;
  proposalDetails: ProposalDetails;
  setProposalDetails: Dispatch<SetStateAction<ProposalDetails>>;
  saveDraftProposal: () => Promise<void>;
  removeDraftProposal: () => void;
  draftProposal: ProposalCardType | null;
  openPreview: boolean;
  setOpenPreview: Dispatch<SetStateAction<boolean>>;
};

export const CreateProposalContext = createContext<CreateProposalContextType>({
  proposalDetails: DEFAULT_PROPOSAL,
  setProposalDetails: () => {},
  step: CreateProposalStep.VOTING_DETAILS,
  setStep: () => {},
  saveDraftProposal: async () => {},
  removeDraftProposal: () => {},
  draftProposal: null,
  openPreview: false,
  setOpenPreview: () => {},
});

export const CreateProposalProvider = ({ children }: PropsWithChildren) => {
  const { account } = useWallet();
  const { fromProposalToDraft } = useDraftProposal();
  const [openPreview, setOpenPreview] = useState(false);
  const [draftProposal, setDraftProposal, removeDraftProposal] = usePerAddressDraftStorage(account?.address);
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails>(DEFAULT_PROPOSAL);
  const [step, setStep] = useState<CreateProposalStep>(CreateProposalStep.VOTING_DETAILS);

  const saveDraftProposal = useCallback(async () => {
    const draft = await fromProposalToDraft(proposalDetails, account?.address || "");
    return setDraftProposal(draft);
  }, [account?.address, fromProposalToDraft, proposalDetails, setDraftProposal]);

  const value = useMemo(
    () => ({
      proposalDetails,
      setProposalDetails,
      step,
      setStep,
      draftProposal,
      saveDraftProposal,
      removeDraftProposal,
      openPreview,
      setOpenPreview,
    }),
    [proposalDetails, step, saveDraftProposal, draftProposal, removeDraftProposal, openPreview, setOpenPreview],
  );

  useEffect(() => {
    if (account?.address) {
      setProposalDetails(prev => ({
        ...prev,
        description: DEFAULT_DESCRIPTION_TEMPLATE(account.address).ops,
      }));
    }
  }, [account?.address]);

  return <CreateProposalContext.Provider value={value}>{children}</CreateProposalContext.Provider>;
};

export const useCreateProposal = () => {
  const context = useContext(CreateProposalContext);
  if (!context) {
    throw new Error("useCreateProposal must be used within a CreateProposalProvider");
  }
  return context;
};
