import { CopyIcon } from "@/icons";
import { Button, Flex, Icon, Link, LinkProps, useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { InfoBox } from "./InfoBox";
import { useI18nContext } from "@/i18n/i18n-react";

export const CopyLink = ({
  textToCopy,
  ...props
}: LinkProps & {
  textToCopy?: string;
}) => {
  const { LL } = useI18nContext();
  const toast = useToast();
  const copy = useCallback(async () => {
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy || "");
    toast({
      position: "bottom",
      render: () => (
        <InfoBox padding={3} alignItems={"center"} variant="approved">
          {LL.copied_to_clipboard()}
        </InfoBox>
      ),
    });
  }, [LL, textToCopy, toast]);
  return (
    <Flex gap={2} alignItems={"center"}>
      <Link {...props} />
      <Button
        onClick={copy}
        variant="ghost"
        minWidth={"fit-content"}
        minH={"fit-content"}
        height={"fit-content"}
        color={props.color}
        padding={0}
        leftIcon={<Icon as={CopyIcon} width={4} height={4} />}
      />
    </Flex>
  );
};
