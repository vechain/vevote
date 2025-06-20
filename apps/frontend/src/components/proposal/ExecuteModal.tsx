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
import { MessageModal } from "../ui/ModalSkeleton";
import { CheckDoubleIcon, CheckIcon, LinkIcon } from "@/icons";
import { FormSkeleton } from "../ui/FormSkeleton";
import { useCallback } from "react";
import { z } from "zod";
import { Label } from "../ui/Label";
import { InputMessage } from "../ui/InputMessage";

export const ExecuteModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const schema = z.object({
    link: z.string(),
  });

  const onSubmit = useCallback((values: z.infer<typeof schema>) => {
    console.log(values);
  }, []);

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
                  <Text fontSize={14} color={"gray.600"} textAlign={"center"}>
                    {LL.proposal.execute_proposal.description()}
                  </Text>
                  <FormControl isInvalid={Boolean(errors.link)}>
                    <Label fontSize={16} label={LL.proposal.execute_proposal.label()} />
                    <InputGroup>
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
                        placeholder={LL.proposal.execute_proposal.link_placeholder()}
                        {...register("link")}
                      />
                    </InputGroup>
                    <InputMessage error={errors.link?.message} />
                  </FormControl>
                </Flex>
              </ModalBody>
              <ModalFooter width={"full"} gap={4} mt={7}>
                <Button flex={1} variant={"tertiary"} onClick={onClose}>
                  {LL.cancel()}
                </Button>
                <Button flex={1} variant={"primary"} type="submit" rightIcon={<Icon as={CheckIcon} />}>
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
