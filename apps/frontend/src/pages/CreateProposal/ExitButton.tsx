import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { Routes } from "@/types/routes";
import { Button, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { IoMdClose } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useCreateProposal } from "./CreateProposalProvider";
import { CreateProposalStep } from "@/types/proposal";

export const ExitButton = () => {
  const { LL } = useI18nContext();
  const { isOpen: isExitOpen, onClose: onExitClose, onOpen: onExitOpen } = useDisclosure();
  const { isOpen: isSavedOpen, onClose: onSavedClose, onOpen: onSavedOpen } = useDisclosure();

  const navigate = useNavigate();

  const { saveDraftProposal, step, draftProposal } = useCreateProposal();

  const onExit = useCallback(() => navigate(Routes.HOME), [navigate]);
  const onSave = useCallback(async () => {
    onExitClose();
    await saveDraftProposal();
    onSavedOpen();
  }, [onExitClose, saveDraftProposal, onSavedOpen]);

  const onContinue = useCallback(() => {
    onSavedClose();
    navigate(`${Routes.PROPOSAL}/draft`);
  }, [navigate, onSavedClose]);

  const exitDescription = useMemo(() => {
    if (step === CreateProposalStep.VOTING_SUMMARY) return LL.proposal.create.exit_proposal.description();
    return LL.proposal.create.exit_proposal.description_last_step();
  }, [LL.proposal.create.exit_proposal, step]);

  return (
    <>
      <Button marginLeft={"auto"} alignItems={"center"} gap={2} onClick={onExitOpen}>
        {LL.exit()}
        <IoMdClose />
      </Button>
      <MessageModal
        isOpen={isExitOpen}
        onClose={onExitClose}
        icon={LuLogOut}
        iconColor={"red.600"}
        title={LL.proposal.create.exit_proposal.title()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {exitDescription}
        </Text>
        {draftProposal && step === CreateProposalStep.VOTING_SUMMARY && (
          <Text textAlign={"center"} fontSize={14} color={"red.500"}>
            {LL.proposal.create.exit_proposal.description_draft_exist()}
          </Text>
        )}

        <ModalFooter width={"full"} gap={4} justifyContent={"space-between"} mt={7}>
          <Button width={"full"} variant={"danger"} onClick={onExit}>
            {LL.proposal.create.exit_proposal.exit_button()}
          </Button>
          {step === CreateProposalStep.VOTING_SUMMARY && (
            <Button width={"full"} variant={"tertiary"} onClick={onSave}>
              {LL.proposal.create.exit_proposal.save_button()}
            </Button>
          )}
        </ModalFooter>
      </MessageModal>
      <MessageModal
        isOpen={isSavedOpen}
        onClose={onSavedClose}
        icon={LuLogOut}
        iconColor={"red.600"}
        title={LL.proposal.create.draft_saved.title()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.create.draft_saved.description()}
        </Text>
        <ModalFooter width={"full"} justifyContent={"space-center"} mt={7}>
          <Button width={"full"} onClick={onContinue}>
            {LL.continue()}
          </Button>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
