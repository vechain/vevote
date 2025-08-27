import { useI18nContext } from "@/i18n/i18n-react";
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
import { MessageModal } from "../../ui/ModalSkeleton";
import { useCallback, useEffect } from "react";
import { FormSkeleton } from "../../ui/FormSkeleton";
import { z } from "zod";
import { Label } from "../../ui/Label";
import { InputMessage } from "../../ui/InputMessage";
import { CheckIcon, DeleteIcon, MinusCircleIcon } from "@/icons";
import { useCancelProposal } from "@/hooks/useCancelProposal";
import { Routes } from "@/types/routes";
import { useNavigate } from "react-router-dom";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";

export const CancelProposal = ({ proposalId }: { proposalId?: string }) => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { sendTransaction, isTransactionPending, status } = useCancelProposal();

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
      } catch (error) {
        const txError = error as { txId?: string; error?: { message?: string }; message?: string };

        trackEvent(MixPanelEvent.PROPOSAL_CANCEL_FAILED, {
          proposalId,
          error: txError.error?.message || txError.message || LL.proposal.unknown_error(),
          transactionId: txError.txId || "unknown",
        });
      }
    },
    [proposalId, sendTransaction, LL.proposal],
  );

  const onSuccessConfirm = useCallback(() => {
    onSuccessClose();
    navigate(Routes.HOME);
  }, [onSuccessClose, navigate]);

  useEffect(() => {
    if (status === "success") {
      onClose();
      onSuccessOpen();
    }
  }, [status, onClose, onSuccessOpen]);
  return (
    <>
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
          <Button width={"full"} onClick={onSuccessConfirm} color={"white"}>
            {LL.continue()}
          </Button>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
