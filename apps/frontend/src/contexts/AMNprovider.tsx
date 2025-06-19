import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { InputMessage } from "@/components/ui/InputMessage";
import { Label } from "@/components/ui/Label";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useBuildMasterNode } from "@/hooks/useMasterNode";
import { CircleInfoIcon } from "@/icons";
import { requiredAddress } from "@/utils/zod";
import { Button, FormControl, Input, ModalBody, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useCallback, useEffect } from "react";
import { z } from "zod";

export const AMNProvider = ({ children }: PropsWithChildren) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { account } = useWallet();

  useEffect(() => {
    if (account && account.address) {
      onOpen();
    }
  }, [account, onOpen]);
  return (
    <>
      {children}
      <AMNPopup isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const AMNPopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const schema = z.object({
    masterNode: requiredAddress,
  });

  const { refetchMasterNode } = useBuildMasterNode();

  const onSubmit = useCallback(
    async (values: z.infer<typeof schema>) => {
      try {
        const res = await refetchMasterNode(values.masterNode);
        console.log("Master Node fetched successfully:", res);
      } catch (error) {
        console.error("Error fetching master node:", error);
      }
    },
    [refetchMasterNode],
  );

  return (
    <MessageModal
      isOpen={isOpen}
      onClose={onClose}
      icon={CircleInfoIcon}
      iconColor={"blue.600"}
      title={"Authority Master Node"}
      closeOnOverlayClick={false}>
      <FormSkeleton onSubmit={onSubmit} schema={schema}>
        {({ register, errors }) => (
          <>
            <ModalBody>
              <Text fontSize={14} color={"gray.600"} py={2} textAlign={"center"}>
                {
                  "Authority Master Node is a decentralized network of nodes responsible for maintaining the integrity and security of the blockchain. It ensures that all transactions are validated and recorded accurately, providing a trustless environment for users."
                }
              </Text>
              <FormControl isInvalid={Boolean(errors.masterNode)}>
                <Label label={"Node Master"} />
                <Input placeholder={""} {...register("masterNode")} />
                <InputMessage error={errors.masterNode?.message} />
              </FormControl>
            </ModalBody>
            <ModalFooter width={"full"} mt={7}>
              <Button flex={1} variant={"secondary"} onClick={onClose}>
                {"I'm don't want to use AMN"}
              </Button>
              <Button flex={1} variant={"primary"} type="submit">
                {"Submit"}
              </Button>
            </ModalFooter>
          </>
        )}
      </FormSkeleton>
    </MessageModal>
  );
};
