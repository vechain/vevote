import { useSendVeVote } from "@/hooks/useSendVeVote"
import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react"
import { useCallback } from "react"
import { useForm } from "react-hook-form"

interface SendForm {
  amount: string
  receiver: string
}

export const SendCard = () => {
  const form = useForm<SendForm>()
  const { errors } = form.formState
  const toast = useToast()

  const sendMutation = useSendVeVote({
    onSuccess: () => {
      form.reset()
      sendMutation.resetStatus()
      toast({
        title: "Success",
        description: "Transaction sent",
        status: "success",
        duration: 9000,
        isClosable: true,
      })
    },
  })
  const onSubmit = useCallback(
    (data: SendForm) => {
      sendMutation.sendTransaction(data)
    },
    [sendMutation],
  )
  const isMinter = true
  if (!isMinter) {
    return null
  }
  return (
    <Card>
      <CardBody>
        <VStack align={"stretch"} as="form" onSubmit={form.handleSubmit(onSubmit)} gap={4}>
          <Text fontSize="lg" fontWeight="bold">
            Send
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
          <FormControl isInvalid={!!errors.receiver}>
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
            Send
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
