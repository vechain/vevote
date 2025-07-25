import { useI18nContext } from "@/i18n/i18n-react";
import { VoteIcon } from "@/icons";
import { Button, Flex, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import { MessageModal } from "../ui/ModalSkeleton";
import { CopyLink } from "../ui/CopyLink";
import { formatAddress } from "@/utils/address";
import { getConfig } from "@repo/config";
import { GenericInfoBox } from "../ui/GenericInfoBox";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

type SuccessVotingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
};

export const SuccessVotingModal = ({ isOpen, onClose, transactionId = "0X" }: SuccessVotingModalProps) => {
  const { LL } = useI18nContext();

  return (
    <MessageModal
      icon={VoteIcon}
      isOpen={isOpen}
      onClose={onClose}
      title={LL.proposal.vote_success.title()}
      iconColor={"primary.500"}>
      <ModalBody>
        <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} textAlign={"center"}>
          {LL.proposal.vote_success.description()}
        </Text>
        {transactionId && (
          <GenericInfoBox variant="info" mt={4}>
            <Flex
              gap={2}
              alignItems={{ base: "start", md: "center" }}
              width={"full"}
              justifyContent={"center"}
              flexDirection={{ base: "column", md: "row" }}>
              <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"}>
                {"See your transaction here:"}
              </Text>

              <CopyLink
                isExternal
                href={`${EXPLORER_URL}/transactions/${transactionId}`}
                fontSize={{ base: 12, md: 14 }}
                color={"primary.500"}
                textToCopy={transactionId}>
                {formatAddress(transactionId)}
              </CopyLink>
            </Flex>
          </GenericInfoBox>
        )}
      </ModalBody>
      <ModalFooter width={"full"} mt={7}>
        <Button flex={1} variant={"primary"} size={{ base: "md", md: "lg" }} onClick={onClose}>
          {LL.continue()}
        </Button>
      </ModalFooter>
    </MessageModal>
  );
};
