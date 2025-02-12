import {
  Badge,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useVeVoteMinter } from "../../../../hooks/useVeVoteMinter";
import { useForm } from "react-hook-form";
import { useCallback } from "react";
import { useMintVeVote } from "../../../../hooks/useMintVeVote";

interface MintForm {
  amount: string;
  receiver: string;
}

export const MintCard = () => {
  const form = useForm<MintForm>();
  const toast = useToast();

  const { errors } = form.formState;

  const mintMutation = useMintVeVote({
    onSuccess: () => {
      form.reset();
      mintMutation.resetStatus();
      toast({
        title: "Success",
        description: "Minted correctly!",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const onSubmit = useCallback(
    (data: MintForm) => {
      mintMutation.sendTransaction(data);
    },
    [mintMutation]
  );

  const { isMinter, minter } = useVeVoteMinter();
  console.log("minter", minter);
  if (!isMinter) {
    return null;
  }
  return (
    <Card>
      <CardBody>
        <VStack
          align={"stretch"}
          as="form"
          onSubmit={form.handleSubmit(onSubmit)}
          gap={4}
        >
          <HStack justify={"flex-end"} w="full">
            {isMinter && <Badge colorScheme="orange">Admin</Badge>}
          </HStack>
          <VStack align={"stretch"}>
            <Text fontSize="lg" fontWeight="bold">
              Mint
            </Text>
            <FormControl isInvalid={!!errors.amount}>
              <FormLabel>Amount</FormLabel>
              <Input
                {...form.register("amount", {
                  required: {
                    value: true,
                    message: "Amount is required",
                  },
                  pattern: {
                    value: /^\d+$/,
                    message: "Invalid amount",
                  },
                })}
              />
              <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.amount}>
              <FormLabel>Receiver</FormLabel>
              <Input
                {...form.register("receiver", {
                  required: {
                    value: true,
                    message: "Receiver is required",
                  },
                  pattern: {
                    value: /^0x[a-fA-F0-9]{40}$/,
                    message: "Invalid address",
                  },
                })}
              />
              <FormErrorMessage>{errors.receiver?.message}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="blue">
              Mint
            </Button>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
