import { CopyIcon } from "@/icons";
import { Button, Flex, Icon, Link, LinkProps } from "@chakra-ui/react";
import { useCallback } from "react";

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
      <Button
        onClick={copy}
        variant="ghost"
        minWidth={"fit-content"}
        color={props.color}
        padding={0}
        leftIcon={<Icon as={CopyIcon} width={4} height={4} />}
      />
    </Flex>
  );
};
