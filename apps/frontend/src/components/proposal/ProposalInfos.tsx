import { Button, Flex, Heading, Icon } from "@chakra-ui/react";
import { IconBadge } from "../ui/IconBadge";
import { forwardRef, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProposal } from "./ProposalProvider";
import { TextEditor } from "../ui/TextEditor";
import { Delta } from "quill";
import { useI18nContext } from "@/i18n/i18n-react";
import { ChevronDownIcon } from "@/icons";
import { motion } from "framer-motion";

export const ProposalInfos = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const infoVariant = useMemo(() => {
    switch (proposal.status) {
      case "min-not-reached":
        return "rejected";
      default:
        return proposal.status;
    }
  }, [proposal.status]);

  const readFull = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    if (containerRef.current) {
      const fullHeight = containerRef.current.scrollHeight;
      const limitedHeight = containerRef.current.clientHeight;
      setContentHeight(fullHeight);
      setShowButton(fullHeight > limitedHeight);
    }
  }, [proposal.description]);

  return (
    <>
      <Flex flexDirection={"column"} gap={{ base: 4, md: 6 }} alignItems={"start"}>
        <IconBadge variant={infoVariant} />
        <Heading fontSize={{ base: 20, md: 32 }} fontWeight={600} color="primary.700">
          {proposal.title}
        </Heading>
      </Flex>
      <Flex flexDirection={"column"} gap={4} alignItems={"start"} width={"full"}>
        <Heading fontSize={{ base: 16, md: 20 }} fontWeight={600} color="primary.700">
          {LL.description()}
        </Heading>
        <ReadOnlyEditorContainer isExpanded={isExpanded} contentHeight={contentHeight} ref={containerRef}>
          <TextEditor readOnly defaultValue={new Delta(proposal.description)} />
        </ReadOnlyEditorContainer>
        {showButton && (
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
              style={{ transition: "all", rotate: isExpanded ? "180deg" : "0deg" }}
            />
          </Button>
        )}
      </Flex>
    </>
  );
};

const ReadOnlyEditorContainer = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ isExpanded?: boolean; contentHeight?: number }>
>(({ children, isExpanded, contentHeight }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ height: "80px" }}
      animate={{
        height: isExpanded ? `${contentHeight}px` : "80px",
      }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        overflow: "hidden",
        lineHeight: 1.6,
        willChange: "height",
      }}>
      {children}
    </motion.div>
  );
});
