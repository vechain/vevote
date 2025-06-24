import { useI18nContext } from "@/i18n/i18n-react";
import { Button, FormControl, Icon, ModalBody, ModalFooter, Text, Textarea, useDisclosure } from "@chakra-ui/react";
import { MessageModal } from "../ui/ModalSkeleton";
import { useCallback, useEffect } from "react";
import { FormSkeleton } from "../ui/FormSkeleton";
import { z } from "zod";
import { Label } from "../ui/Label";
import { InputMessage } from "../ui/InputMessage";
import { DeleteIcon, MinusCircleIcon } from "@/icons";
import { useCancelProposal } from "@/hooks/useCancelProposal";
import { Routes } from "@/types/routes";
import { useNavigate } from "react-router-dom";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";

export const CancelProposal = ({ proposalId }: { proposalId?: string }) => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const navigate = useNavigate();

  const { sendTransaction, error, isTransactionPending, txReceipt, status } = useCancelProposal();

  const schema = z.object({
    reason: z.string().optional(),
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof schema>) => {
      if (!proposalId) return;
      await sendTransaction({ proposalId, reason: values.reason });
    },
    [proposalId, sendTransaction],
  );

  useEffect(() => {
    if (status === "success") {
      onClose();
      navigate(Routes.HOME);
    }
  }, [error, isTransactionPending, navigate, onClose, status, txReceipt]);
  return (
    <>
      <Button
        variant="danger"
        onClick={() => {
          trackEvent(MixPanelEvent.CTA_CANCEL_CLICKED, {
            proposalId: proposalId || "",
          });
          onOpen();
        }}
        leftIcon={<Icon as={MinusCircleIcon} />}>
        {LL.cancel()}
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
                <Text fontSize={14} color={"gray.600"} py={2} textAlign={"center"}>
                  {LL.proposal.cancel_proposal.description()}
                </Text>
                <FormControl isInvalid={Boolean(errors.reason)}>
                  <Label label={LL.proposal.cancel_proposal.reason()} />
                  <Textarea placeholder={LL.proposal.cancel_proposal.reason_placeholder()} {...register("reason")} />
                  <InputMessage error={errors.reason?.message} />
                </FormControl>
              </ModalBody>
              <ModalFooter width={"full"} gap={4} mt={7}>
                <Button flex={1} variant={"secondary"} onClick={onClose}>
                  {LL.go_back()}
                </Button>
                <Button flex={1} variant={"danger"} type="submit" isLoading={isTransactionPending}>
                  {LL.proposal.cancel_proposal.title()}
                </Button>
              </ModalFooter>
            </>
          )}
        </FormSkeleton>
      </MessageModal>
    </>
  );
};
