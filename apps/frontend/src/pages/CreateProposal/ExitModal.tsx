import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { Routes } from "@/types/routes";
import { Button, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useCreateProposal } from "./CreateProposalProvider";
import { CreateProposalStep } from "@/types/proposal";
import { CheckIcon, LogoutIcon } from "@/icons";

export const ExitModal = ({ isExitOpen, onExitClose }: { isExitOpen: boolean; onExitClose: () => void }) => {
  const { LL } = useI18nContext();
  const { isOpen: isSavedOpen, onClose: onSavedClose, onOpen: onSavedOpen } = useDisclosure();

  const navigate = useNavigate();

  const { saveDraftProposal, step, draftProposal, setStep } = useCreateProposal();

  const onExit = useCallback(() => {
    setStep(CreateProposalStep.VOTING_DETAILS);
    navigate(Routes.HOME);
  }, [navigate, setStep]);

  const onSave = useCallback(async () => {
    onExitClose();
    await saveDraftProposal();
    onSavedOpen();
  }, [onExitClose, saveDraftProposal, onSavedOpen]);

  const onContinue = useCallback(() => {
    onSavedClose();
    setStep(CreateProposalStep.VOTING_DETAILS);
    navigate(`${Routes.PROPOSAL}/draft`);
  }, [navigate, onSavedClose, setStep]);

  const exitDescription = useMemo(() => {
    if (step === CreateProposalStep.VOTING_SUMMARY) return LL.proposal.create.exit_proposal.description();
    return LL.proposal.create.exit_proposal.description_last_step();
  }, [LL.proposal.create.exit_proposal, step]);

  return (
    <>
      <MessageModal
        isOpen={isExitOpen}
        onClose={onExitClose}
        icon={LogoutIcon}
        iconColor={"red.600"}
        title={LL.proposal.create.exit_proposal.title()}>
        <Text textAlign={"center"} fontSize={{ base: 12, md: 14 }} color={"gray.600"}>
          {exitDescription}
        </Text>
        {draftProposal && step === CreateProposalStep.VOTING_SUMMARY && (
          <Text textAlign={"center"} fontSize={14} color={"red.500"}>
            {LL.proposal.create.exit_proposal.description_draft_exist()}
          </Text>
        )}

        <ModalFooter width={"full"} gap={4} justifyContent={"space-between"} mt={7}>
          <Button width={"full"} variant={"danger"} onClick={onExit} size={{ base: "md", md: "lg" }}>
            {LL.proposal.create.exit_proposal.exit_button()}
          </Button>
          {step === CreateProposalStep.VOTING_SUMMARY && (
            <Button width={"full"} variant={"tertiary"} onClick={onSave} size={{ base: "md", md: "lg" }}>
              {LL.proposal.create.exit_proposal.save_button()}
            </Button>
          )}
        </ModalFooter>
      </MessageModal>
      <MessageModal
        isOpen={isSavedOpen}
        onClose={onSavedClose}
        icon={CheckIcon}
        iconColor={"primary.500"}
        title={LL.proposal.create.draft_saved.title()}>
        <Text textAlign={"center"} fontSize={{ base: 12, md: 14 }} color={"gray.600"}>
          {LL.proposal.create.draft_saved.description()}
        </Text>
        <ModalFooter width={"full"} justifyContent={"space-center"} mt={7}>
          <Button width={"full"} onClick={onContinue} size={{ base: "md", md: "lg" }}>
            {LL.continue()}
          </Button>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
