import { useI18nContext } from "@/i18n/i18n-react";
import { MessageModal } from "../ui/ModalSkeleton";
import { CheckIcon } from "@/icons";
import { Button, ModalBody, ModalFooter, Text } from "@chakra-ui/react";

type SuccessVotingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SuccessVotingModal = ({ isOpen, onClose }: SuccessVotingModalProps) => {
  const { LL } = useI18nContext();

  return (
    <MessageModal
      icon={CheckIcon}
      isOpen={isOpen}
      onClose={onClose}
      title={LL.proposal.vote_success.title()}
      iconColor={"green.500"}>
      <ModalBody>
        <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} textAlign={"center"}>
          {LL.proposal.vote_success.description()}
        </Text>
      </ModalBody>
      <ModalFooter width={"full"} mt={7}>
        <Button flex={1} variant={"primary"} size={{ base: "md", md: "lg" }} onClick={onClose}>
          {LL.close()}
        </Button>
      </ModalFooter>
    </MessageModal>
  );
};
