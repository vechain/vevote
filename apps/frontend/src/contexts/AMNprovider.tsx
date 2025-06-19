import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { InputMessage } from "@/components/ui/InputMessage";
import { Label } from "@/components/ui/Label";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useBuildMasterNode } from "@/hooks/useMasterNode";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon } from "@/icons";
import { MasterNodeStorage } from "@/types/AMN";
import { requiredAddress } from "@/utils/zod";
import { Button, FormControl, Input, ModalBody, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect } from "react";
import { z } from "zod";

const AMNContext = createContext<{
  masterNode: MasterNodeStorage;
}>({
  masterNode: { checked: false },
});

export const AMNProvider = ({ children }: PropsWithChildren) => {
  const [masterNode, setMasterNode] = useLocalStorage<MasterNodeStorage>("master-node", {
    checked: false,
  });
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { account } = useWallet();

  useEffect(() => {
    if (account && account.address && !masterNode.checked) {
      onOpen();
    }
  }, [account, masterNode.checked, onOpen]);
  return (
    <AMNContext.Provider value={{ masterNode }}>
      {children}
      <AMNPopup isOpen={isOpen} onClose={onClose} setMasterNode={setMasterNode} />
    </AMNContext.Provider>
  );
};

const AMNPopup = ({
  isOpen,
  onClose,
  setMasterNode,
}: {
  isOpen: boolean;
  onClose: () => void;
  setMasterNode: (value: MasterNodeStorage) => void;
}) => {
  const { LL } = useI18nContext();
  const schema = z.object({
    masterNode: requiredAddress,
  });

  const { refetchMasterNode } = useBuildMasterNode();

  const onSubmit = useCallback(
    async (values: z.infer<typeof schema>) => {
      try {
        const res = await refetchMasterNode(values.masterNode);

        if (!res) {
          throw new Error("Failed to fetch master node data");
        }

        setMasterNode({
          checked: true,
          address: values.masterNode,
        });

        onClose();

        console.log("Master Node fetched successfully:", res);
      } catch (error) {
        console.error("Error fetching master node:", error);
      }
    },
    [onClose, refetchMasterNode, setMasterNode],
  );

  const onCancel = useCallback(() => {
    setMasterNode({
      checked: true,
    });
    onClose();
  }, [onClose, setMasterNode]);

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
                <Label label={"Master node"} fontSize={14} />
                <Input placeholder={""} {...register("masterNode")} width={"full"} />
                <InputMessage error={errors.masterNode?.message} />
              </FormControl>
            </ModalBody>
            <ModalFooter width={"full"} gap={2} mt={7}>
              <Button flex={1} variant={"secondary"} onClick={onCancel}>
                {LL.cancel()}
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

export const useAMN = () => {
  const context = useContext(AMNContext);
  if (!context) {
    throw new Error("useAMN must be used within an AMNProvider");
  }
  return context;
};
