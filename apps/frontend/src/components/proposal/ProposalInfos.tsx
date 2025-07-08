import { Box, Button, Flex, Heading, Icon } from "@chakra-ui/react";
import { IconBadge } from "../ui/IconBadge";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { useProposal } from "./ProposalProvider";
import { TextEditor } from "../ui/TextEditor";
import { Delta } from "quill";
import { useI18nContext } from "@/i18n/i18n-react";
import { ChevronDownIcon } from "@/icons";

export const ProposalInfos = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();
  const [maxHeight, setMaxHeight] = useState<"4lh" | undefined>("4lh");
  const infoVariant = useMemo(() => {
    switch (proposal.status) {
      case "min-not-reached":
        return "rejected";
      default:
        return proposal.status;
    }
  }, [proposal.status]);

  const readFull = useCallback(() => {
    if (!maxHeight) setMaxHeight("4lh");
    else setMaxHeight(undefined);
  }, [maxHeight]);

  return (
    <>
      <Flex flexDirection={"column"} gap={{ base: 4, md: 6 }} alignItems={"start"}>
        <IconBadge variant={infoVariant} />
        <Heading fontSize={{ base: 20, md: 32 }} fontWeight={600} color="primary.700">
          {proposal.title}
        </Heading>
      </Flex>
      <Flex flexDirection={"column"} gap={4} alignItems={"start"}>
        <Heading fontSize={{ base: 16, md: 20 }} fontWeight={600} color="primary.700">
          {LL.description()}
        </Heading>
        <ReadOnlyEditorContainer maxHeight={maxHeight}>
          <TextEditor readOnly defaultValue={new Delta(proposal.description)} />
        </ReadOnlyEditorContainer>
        <Button
          variant="ghost"
          size={"none"}
          display={"flex"}
          alignItems={"center"}
          color={"primary.600"}
          onClick={readFull}
          gap={1.5}
          fontSize={{ base: "14px", md: "16px" }}>
          {LL.read_full_description()}
          <Icon
            as={ChevronDownIcon}
            width={4}
            height={4}
            style={{ transition: "all", rotate: !maxHeight ? "180deg" : "0deg" }}
          />
        </Button>
      </Flex>
    </>
  );
};

const ReadOnlyEditorContainer = ({ children, maxHeight }: PropsWithChildren<{ maxHeight?: string }>) => {
  return (
    <Box lineHeight={1.6} overflow={"hidden"} maxHeight={maxHeight}>
      {children}
    </Box>
  );
};
