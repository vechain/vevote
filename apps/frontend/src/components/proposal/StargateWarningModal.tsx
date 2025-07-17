import { AlertTriangleIcon } from "@/icons";
import { MessageModal } from "../ui/ModalSkeleton";
import { Button, Flex, FormControl, Input, Link, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { Label } from "../ui/Label";
import { InputMessage } from "../ui/InputMessage";
import { FormSkeleton } from "../ui/FormSkeleton";
import { z } from "zod";
import { useCallback } from "react";
import { GenericInfoBox } from "../ui/GenericInfoBox";

type StargateWarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setHasAccepted?: (value: boolean) => void;
};

export const stargateUrl = "https://app.stargate.vechain.org/";

export const StargateWarningModal = ({ isOpen, onClose, setHasAccepted }: StargateWarningModalProps) => {
  const { LL } = useI18nContext();

  const schema = z.object({
    validator: z.literal("agree-with-this", {
      errorMap: () => ({ message: LL.stargate_warning.confirmation_error() }),
    }),
  });

  const onSubmit = useCallback(() => {
    setHasAccepted?.(true);
    onClose();
  }, [onClose, setHasAccepted]);

  return (
    // TODO: Refactor this modal
    <MessageModal
      isOpen={isOpen}
      onClose={onClose}
      icon={AlertTriangleIcon}
      iconColor={"primary.blue"}
      title={LL.stargate_warning.title()}
      closeOnOverlayClick={false}>
      <FormSkeleton schema={schema} onSubmit={onSubmit}>
        {({ register, errors }) => (
          <>
            <ModalBody>
              <Flex direction={"column"} gap={4} mb={6}>
                <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} lineHeight={1.5}>
                  {LL.stargate_warning.description()}
                </Text>

                <GenericInfoBox variant="warning">
                  <Text fontSize={{ base: 12, md: 14 }}>{LL.stargate_warning.ongoing_proposal_warning()}</Text>
                </GenericInfoBox>

                <Button as={Link} display={"block"} href={stargateUrl} isExternal textAlign="center">
                  {"Go to Stargate Migration"}
                </Button>
              </Flex>

              <FormControl isInvalid={Boolean(errors.validator)}>
                <Label
                  fontSize={{ base: 13, md: 15 }}
                  label={LL.stargate_warning.confirmation_instruction()}
                  color="gray.700"
                />
                <Input
                  width={"full"}
                  {...register("validator")}
                  placeholder="agree-with-this"
                  fontSize={{ base: 13, md: 15 }}
                />
                <InputMessage error={errors.validator?.message} />
              </FormControl>
            </ModalBody>
            <ModalFooter width={"full"} gap={4} mt={7}>
              <Button flex={1} variant={"danger"} type="submit">
                {LL.continue()}
              </Button>
            </ModalFooter>
          </>
        )}
      </FormSkeleton>
    </MessageModal>
  );
};
