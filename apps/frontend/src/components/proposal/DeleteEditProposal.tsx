import { useI18nContext } from "@/i18n/i18n-react";
import { Button, ModalBody, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { FiMinusCircle } from "react-icons/fi";
import { MessageModal } from "../ui/ModalSkeleton";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useCallback } from "react";

export const DeleteEditProposal = () => {
  return (
    <>
      <DeleteProposal />
      <Button variant={"secondary"}>{"Edit"}</Button>
    </>
  );
};

export const DeleteProposal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();

  //todo: implement deletion
  const onDelete = useCallback(() => {
    console.log("delete");
  }, []);
  return (
    <>
      <Button variant="danger" onClick={onOpen}>
        <FiMinusCircle size={24} />
        {LL.delete()}
      </Button>
      <MessageModal
        isOpen={isOpen}
        onClose={onClose}
        icon={RiDeleteBin6Line}
        iconColor={"red.600"}
        title={LL.proposal.delete_proposal.title()}>
        <ModalBody>
          <Text fontSize={14} color={"gray.600"} py={2} textAlign={"center"}>
            {LL.proposal.delete_proposal.description()}
          </Text>
          <Text fontSize={14} color={"gray.600"} fontWeight={500} textAlign={"center"}>
            {LL.proposal.delete_proposal.confirmation()}
          </Text>
        </ModalBody>
        <ModalFooter width={"full"} gap={4} mt={7}>
          <Button flex={1} variant={"secondary"} onClick={onClose}>
            {LL.proposal.delete_proposal.no_go_back()}
          </Button>
          <Button flex={1} variant={"danger"} onClick={onDelete}>
            {LL.proposal.delete_proposal.yes_delete()}
          </Button>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
