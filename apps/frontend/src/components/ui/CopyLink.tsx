import { Button, Flex, Link, LinkProps } from "@chakra-ui/react";
import { useCallback } from "react";
import { LuCopy } from "react-icons/lu";

export const CopyLink = ({
  textToCopy,
  ...props
}: LinkProps & {
  textToCopy?: string;
}) => {
  const copy = useCallback(() => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy || "");
  }, [textToCopy]);
  return (
    <Flex gap={2} alignItems={"center"}>
      <Link {...props} />
      <Button onClick={copy} variant="outline" colorScheme="blue" size="sm">
        <LuCopy />
      </Button>
    </Flex>
  );
};
