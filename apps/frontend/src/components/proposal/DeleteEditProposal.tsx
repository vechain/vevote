import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Icon, ModalBody, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { MessageModal } from "../ui/ModalSkeleton";
import { useCallback } from "react";
import { DEFAULT_PROPOSAL, useCreateProposal } from "@/pages/CreateProposal/CreateProposalProvider";
import { useDraftProposal } from "@/hooks/useDraftProposal";
import { useNavigate } from "react-router-dom";
import { Routes } from "@/types/routes";
import { DeleteIcon, EditBoxIcon } from "@/icons";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";

export const DeleteEditProposal = () => {
  const { LL } = useI18nContext();
  const navigate = useNavigate();
  const { draftProposal, setProposalDetails } = useCreateProposal();
  const { fromDraftToProposal } = useDraftProposal();
  const onEdit = useCallback(() => {
    setProposalDetails(fromDraftToProposal(draftProposal, DEFAULT_PROPOSAL));
    navigate(Routes.CREATE_PROPOSAL);
  }, [draftProposal, fromDraftToProposal, navigate, setProposalDetails]);
  return (
    <>
      <DeleteProposal />
      <Button
        variant={"secondary"}
        size={{ base: "md", md: "lg" }}
        onClick={() => {
          trackEvent(MixPanelEvent.CTA_EDIT_CLICKED, {
            proposalId: draftProposal?.title || "draft",
          });
          onEdit();
        }}
        leftIcon={<Icon as={EditBoxIcon} boxSize={{ base: 5, md: 6 }} />}>
        <Text display={{ base: "none", md: "block" }}>{LL.edit()}</Text>
      </Button>
    </>
  );
};

export const DeleteProposal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const navigate = useNavigate();

  const { removeDraftProposal, draftProposal } = useCreateProposal();

  const onDelete = useCallback(() => {
    removeDraftProposal();
    navigate(Routes.HOME);
  }, [navigate, removeDraftProposal]);
  return (
    <>
      <Button
        variant="danger"
        size={{ base: "md", md: "lg" }}
        onClick={() => {
          trackEvent(MixPanelEvent.CTA_DELETE_CLICKED, {
            proposalId: draftProposal?.title || "draft",
          });
          onOpen();
        }}
        leftIcon={<Icon as={DeleteIcon} boxSize={{ base: 5, md: 6 }} />}>
        <Text display={{ base: "none", md: "block" }}>{LL.delete()}</Text>
      </Button>
      <MessageModal
        isOpen={isOpen}
        onClose={onClose}
        icon={DeleteIcon}
        iconColor={"red.600"}
        title={LL.proposal.delete_proposal.title()}>
        <ModalBody>
          <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} py={2} textAlign={"center"}>
            {LL.proposal.delete_proposal.description()}
          </Text>
          <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} fontWeight={500} textAlign={"center"}>
            {LL.proposal.delete_proposal.confirmation()}
          </Text>
        </ModalBody>
        <ModalFooter width={"full"} gap={4} mt={7}>
          <Button flex={1} variant={"secondary"} onClick={onClose} size={{ base: "md", md: "lg" }}>
            {LL.proposal.delete_proposal.no_go_back()}
          </Button>
          <Button flex={1} variant={"danger"} onClick={onDelete} size={{ base: "md", md: "lg" }}>
            {LL.proposal.delete_proposal.yes_delete()}
          </Button>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
