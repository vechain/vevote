import { useI18nContext } from "@/i18n/i18n-react";
import { Button, FormControl, Icon, ModalBody, ModalFooter, Text, Textarea, useDisclosure } from "@chakra-ui/react";
import { MessageModal } from "../ui/ModalSkeleton";
import { useCallback } from "react";
import { FormSkeleton } from "../ui/FormSkeleton";
import { z } from "zod";
import { Label } from "../ui/Label";
import { InputMessage } from "../ui/InputMessage";
import { DeleteIcon, MinusCircleIcon } from "@/icons";

export const CancelEditProposal = () => {
  const { LL } = useI18nContext();
  return (
    <>
      <CancelProposal />
      <Button variant={"secondary"}>{LL.edit()}</Button>
    </>
  );
};

export const CancelProposal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const schema = z.object({
    reason: z.string().optional(),
  });

  //todo: implement deletion
  const onSubmit = useCallback((values: z.infer<typeof schema>) => {
    console.log(values);
  }, []);
  return (
    <>
      <Button variant="danger" onClick={onOpen} leftIcon={<Icon as={MinusCircleIcon} />}>
        {LL.cancel()}
      </Button>
      <MessageModal
        isOpen={isOpen}
        onClose={onClose}
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
                <Button flex={1} variant={"danger"} type="submit">
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
