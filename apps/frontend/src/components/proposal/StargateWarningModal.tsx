import { CircleInfoIcon } from "@/icons";
import { MessageModal } from "../ui/ModalSkeleton";
import { Button, FormControl, Input, Link, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { Label } from "../ui/Label";
import { InputMessage } from "../ui/InputMessage";
import { FormSkeleton } from "../ui/FormSkeleton";
import { z } from "zod";

type StargateWarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const StargateWarningModal = ({ isOpen, onClose }: StargateWarningModalProps) => {
  const { LL } = useI18nContext();

  const schema = z.object({
    validator: z.literal("agree-with-this", {
      errorMap: () => ({ message: "the message is wrong" }),
    }),
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log("User agreed with the message:", data);
    onClose();
  };

  return (
    <MessageModal
      isOpen={isOpen}
      onClose={onClose}
      icon={CircleInfoIcon}
      iconColor={"blue.500"}
      title="Stargate Nodes"
      closeOnOverlayClick={false}>
      <FormSkeleton schema={schema} onSubmit={onSubmit}>
        {({ register, errors }) => (
          <>
            <ModalBody>
              <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"} py={2} textAlign={"center"}>
                {
                  "You have 1 or more non migrated nodes. Please migrate them as soon as possible. You can continue using the app, but you will not be able to vote with these nodes until they are migrated."
                }
              </Text>
              <Link display={"block"} href="https://app.stargate.vechain.org/" isExternal pb={2}>
                {"https://app.stargate.vechain.org/"}
              </Link>
              <FormControl isInvalid={Boolean(errors.validator)}>
                <Label
                  fontSize={{ base: 14, md: 16 }}
                  label="if you want to continue anyway, write this text: agree-with-this"
                />
                <Input width={"full"} {...register("validator")} />
                <InputMessage error={errors.validator?.message} />
              </FormControl>
            </ModalBody>
            <ModalFooter width={"full"} gap={4} mt={7}>
              <Button flex={1} variant={"primary"} type="submit">
                {LL.continue()}
              </Button>
            </ModalFooter>
          </>
        )}
      </FormSkeleton>
    </MessageModal>
  );
};
