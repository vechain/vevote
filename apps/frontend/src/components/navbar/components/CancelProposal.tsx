import { useCancelProposal } from "@/hooks/useCancelProposal";
import { useI18nContext } from "@/i18n/i18n-react";
import { CheckIcon, DeleteIcon, MinusCircleIcon } from "@/icons";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import {
  Button,
  FormControl,
  Icon,
  ModalBody,
  ModalFooter,
  Text,
  Textarea,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { z } from "zod";
import { FormSkeleton } from "../../ui/FormSkeleton";
import { InputMessage } from "../../ui/InputMessage";
import { Label } from "../../ui/Label";
import { MessageModal } from "../../ui/ModalSkeleton";

export const CancelProposal = ({ proposalId, showButton }: { proposalId?: string; showButton: boolean }) => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { sendTransaction, isTransactionPending } = useCancelProposal({ proposalId });

  const schema = z.object({
    reason: z.string().optional(),
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof schema>) => {
      if (!proposalId) return;

      try {
        trackEvent(MixPanelEvent.PROPOSAL_CANCEL, {
          proposalId,
        });

        const result = await sendTransaction({ proposalId, reason: values.reason });

        trackEvent(MixPanelEvent.PROPOSAL_CANCEL_SUCCESS, {
          proposalId,
          transactionId: result.txId,
        });

        onClose();
        onSuccessOpen();
      } catch (error) {
        const txError = error as { txId?: string; error?: { message?: string }; message?: string };

        trackEvent(MixPanelEvent.PROPOSAL_CANCEL_FAILED, {
          proposalId,
          error: txError.error?.message || txError.message || LL.proposal.unknown_error(),
          transactionId: txError.txId || "unknown",
        });
      }
    },
    [proposalId, sendTransaction, onClose, onSuccessOpen, LL.proposal],
  );
  return (
    <>
      {showButton && (
        <Button
          variant="danger"
          size={{ base: "md", md: "lg" }}
          onClick={() => {
            trackEvent(MixPanelEvent.CTA_CANCEL_CLICKED, {
              proposalId: proposalId || "",
            });
            onOpen();
          }}
          leftIcon={<Icon as={MinusCircleIcon} />}>
          {!isMobile && LL.cancel()}
        </Button>
      )}

      <MessageModal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        icon={DeleteIcon}
        iconColor={"red.600"}
        title={LL.proposal.cancel_proposal.title()}>
        <FormSkeleton onSubmit={onSubmit} schema={schema}>
          {({ register, errors }) => (
            <>
              <ModalBody>
                <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} py={2} textAlign={"center"}>
                  {LL.proposal.cancel_proposal.description()}
                </Text>
                <FormControl isInvalid={Boolean(errors.reason)}>
                  <Label label={LL.proposal.cancel_proposal.reason()} />
                  <Textarea placeholder={LL.proposal.cancel_proposal.reason_placeholder()} {...register("reason")} />
                  <InputMessage error={errors.reason?.message} />
                </FormControl>
              </ModalBody>
              <ModalFooter width={"full"} gap={4} mt={7}>
                <Button flex={1} variant={"secondary"} onClick={onClose} size={{ base: "md", md: "lg" }}>
                  {LL.go_back()}
                </Button>
                <Button
                  flex={1}
                  variant={"danger"}
                  type="submit"
                  isLoading={isTransactionPending}
                  size={{ base: "md", md: "lg" }}>
                  {LL.proposal.cancel_proposal.title()}
                </Button>
              </ModalFooter>
            </>
          )}
        </FormSkeleton>
      </MessageModal>
      {/* Success modal */}
      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={CheckIcon}
        iconColor={"primary.500"}
        title={LL.proposal.cancel_proposal.success_title()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.cancel_proposal.success_description()}
        </Text>
        <ModalFooter width={"full"} mt={7}>
          <Button width={"full"} onClick={onSuccessClose} color={"white"}>
            {LL.continue()}
          </Button>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
