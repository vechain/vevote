import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { Routes } from "@/types/routes";
import { Button, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useCallback } from "react";
import { IoMdClose } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useCreateProposal } from "./CreateProposalProvider";

export const ExitButton = () => {
  const { LL } = useI18nContext();
  const { isOpen: isExitOpen, onClose: onExitClose, onOpen: onExitOpen } = useDisclosure();
  const { isOpen: isSavedOpen, onClose: onSavedClose, onOpen: onSavedOpen } = useDisclosure();

  const navigate = useNavigate();

  const { saveDraftProposal } = useCreateProposal();

  const onExit = useCallback(() => navigate(Routes.HOME), [navigate]);
  const onSave = useCallback(async () => {
    await saveDraftProposal();
    onSavedOpen();
  }, [saveDraftProposal, onSavedOpen]);

  const onContinue = useCallback(() => {
    onSavedClose();
    // navigate(`${Routes.PROPOSAL}/draft`);
    onExit();
  }, [onExit, onSavedClose]);

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
          {LL.proposal.create.exit_proposal.description()}
        </Text>
        <ModalFooter width={"full"} gap={4} justifyContent={"space-between"} mt={7}>
          <Button width={"full"} variant={"danger"} onClick={onExit}>
            {LL.proposal.create.exit_proposal.exit_button()}
          </Button>
          <Button width={"full"} variant={"tertiary"} onClick={onSave}>
            {LL.proposal.create.exit_proposal.save_button()}
          </Button>
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
