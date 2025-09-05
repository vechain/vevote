import { AlertTriangleIcon } from "@/icons";
import { FormErrorMessage, FormHelperText, Icon, Text } from "@chakra-ui/react";

type InputMessageProps = {
  message?: string;
  error?: string;
};

export const InputMessage = ({ error, message }: InputMessageProps) => {
  if (!error && !message) return null;
  if (error)
    return (
      <FormErrorMessage display={"flex"} gap={2} alignItems={"center"}>
        <Icon width={4} height={4} as={AlertTriangleIcon} color={"red.500"} />
        <Text fontSize={"12px"}>{error}</Text>
      </FormErrorMessage>
    );
  return (
    <FormHelperText fontSize={"12px"} whiteSpace={"pre"}>
      {message}
    </FormHelperText>
  );
};
