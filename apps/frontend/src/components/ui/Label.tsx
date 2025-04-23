import { Flex, FormLabel, Text, TextProps } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { PropsWithChildren } from "react";

type LabelProps = PropsWithChildren<{
  label: string;
  isOptional?: boolean;
}>;
const Label = ({ label, isOptional, children }: LabelProps) => {
  const { LL } = useI18nContext();
  return (
    <Flex gap={"8px"}>
      <FormLabel flex={1} fontSize={20} color={"gray.600"} fontWeight={600}>
        {label}
      </FormLabel>
      {children && children}
      {isOptional && <Message message={LL.optional()} />}
    </Flex>
  );
};

const Message = ({ message, ...props }: { message: string } & TextProps) => {
  return (
    <Text fontSize={"12px"} color={"gray.500"} {...props}>
      {message}
    </Text>
  );
};

const Subtitle = ({ label, ...props }: { label: string } & TextProps) => {
  return (
    <Text color={"gray.500"} alignSelf={"stretch"} paddingBottom={"16px"} {...props}>
      {label}
    </Text>
  );
};

Label.Message = Message;
Label.Subtitle = Subtitle;

export { Label };
