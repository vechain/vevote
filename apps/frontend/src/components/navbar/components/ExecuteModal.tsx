import { useI18nContext } from "@/i18n/i18n-react";
import {
  Button,
  Flex,
  FormControl,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  ModalBody,
  ModalFooter,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { MessageModal } from "../../ui/ModalSkeleton";
import { CheckDoubleIcon, CheckIcon, LinkIcon } from "@/icons";
import { FormSkeleton, FormSkeletonProps } from "../../ui/FormSkeleton";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import { Label } from "../../ui/Label";
import { InputMessage } from "../../ui/InputMessage";
import { useExecuteProposal } from "@/hooks/useExecuteProposal";

export const ExecuteModal = ({ proposalId }: { proposalId: string }) => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { sendTransaction, isTransactionPending, isWaitingForWalletConfirmation } = useExecuteProposal({ proposalId });

  const isLoading = useMemo(
    () => isTransactionPending || isWaitingForWalletConfirmation,
    [isTransactionPending, isWaitingForWalletConfirmation],
  );

  const schema = z.object({
    link: z.string(),
  });

  const onSubmit: FormSkeletonProps<z.infer<typeof schema>>["onSubmit"] = useCallback(
    async ({ link }, { setError }) => {
      try {
        await sendTransaction({ proposalId, link });
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : LL.proposal.failed_to_execute_proposal();
        setError("link", { message: errorMessage });
      }
    },
    [sendTransaction, proposalId, onClose, LL.proposal],
  );

  return (
    <>
      <Button onClick={onOpen} variant={"feedback"}>
        {LL.proposal.mark_as_executed()}
      </Button>
      <MessageModal
        icon={CheckDoubleIcon}
        isOpen={isOpen}
        onClose={onClose}
        title={LL.proposal.execute_proposal.title()}
        iconColor={"primary.500"}>
        <FormSkeleton onSubmit={onSubmit} schema={schema}>
          {({ register, errors }) => (
            <>
              <ModalBody>
                <Flex direction="column" gap={3}>
                  <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} textAlign={"center"}>
                    {LL.proposal.execute_proposal.description()}
                  </Text>
                  <FormControl isInvalid={Boolean(errors.link)}>
                    <Label fontSize={16} label={LL.proposal.execute_proposal.label()} />
                    <InputGroup width={"full"}>
                      <InputLeftAddon
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        backgroundColor={"gray.50"}
                        w={12}
                        h={12}
                        p={1.5}>
                        <Icon color={"gray.500"} w={5} h={5} as={LinkIcon} />
                      </InputLeftAddon>
                      <Input
                        type="text"
                        width="full"
                        maxWidth={"full"}
                        placeholder={LL.proposal.execute_proposal.link_placeholder()}
                        {...register("link")}
                      />
                    </InputGroup>
                    <InputMessage error={errors.link?.message} />
                  </FormControl>
                </Flex>
              </ModalBody>
              <ModalFooter width={"full"} gap={4} mt={7}>
                <Button flex={1} variant={"tertiary"} onClick={onClose} size={{ base: "md", md: "lg" }}>
                  {LL.cancel()}
                </Button>
                <Button
                  flex={1}
                  variant={"primary"}
                  type="submit"
                  rightIcon={<Icon as={CheckIcon} />}
                  isLoading={isLoading}
                  loadingText={LL.confirm()}
                  size={{ base: "md", md: "lg" }}>
                  {LL.confirm()}
                </Button>
              </ModalFooter>
            </>
          )}
        </FormSkeleton>
      </MessageModal>
    </>
  );
};
