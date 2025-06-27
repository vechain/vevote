import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon } from "@/icons";
import { useCreateProposal } from "@/pages/CreateProposal/CreateProposalProvider";
import { Button, ModalBody, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useCallback, useEffect } from "react";

export const DraftProposalProvider = ({ children }: PropsWithChildren) => {
  const { account, connection } = useWallet();
  const { draftProposal } = useCreateProposal();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (draftProposal && connection.isConnected && draftProposal.proposer !== account?.address) {
      onOpen();
    }
  }, [draftProposal, account?.address, onOpen, connection.isConnected]);

  return (
    <>
      {children}
      <DraftDialog isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const DraftDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { LL } = useI18nContext();

  const { removeDraftProposal } = useCreateProposal();
  const { disconnect } = useWallet();

  const onDisconnect = useCallback(async () => {
    await disconnect();
    onClose();
  }, [disconnect, onClose]);

  const onContinue = useCallback(() => {
    removeDraftProposal();
    onClose();
  }, [removeDraftProposal, onClose]);

  return (
    <MessageModal
      isOpen={isOpen}
      onClose={onClose}
      icon={CircleInfoIcon}
      iconColor={"blue.500"}
      closeOnOverlayClick={false}
      title={LL.proposal.draft_dialog.title()}>
      <ModalBody>
        <Text fontSize={14} color={"gray.600"} py={2} textAlign={"center"}>
          {LL.proposal.draft_dialog.description()}
        </Text>
      </ModalBody>
      <ModalFooter width={"full"} gap={4} mt={7}>
        <Button flex={1} variant={"secondary"} onClick={onDisconnect}>
          {LL.disconnect()}
        </Button>
        <Button flex={1} variant={"primary"} onClick={onContinue}>
          {LL.continue()}
        </Button>
      </ModalFooter>
    </MessageModal>
  );
};
