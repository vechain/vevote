import { FormErrorMessage, FormHelperText, Icon, Text } from "@chakra-ui/react";
import { FiAlertTriangle } from "react-icons/fi";

type InputMessageProps = {
  message?: string;
  error?: string;
};

export const InputMessage = ({ error, message }: InputMessageProps) => {
  if (!error && !message) return null;
  if (error)
    return (
      <FormErrorMessage display={"flex"} gap={2} alignItems={"center"}>
        <Icon size={"xs"} as={FiAlertTriangle} color={"red.500"} />
        <Text fontSize={"12px"}>{error}</Text>
      </FormErrorMessage>
    );
  return <FormHelperText fontSize={"12px"}>{message}</FormHelperText>;
};
