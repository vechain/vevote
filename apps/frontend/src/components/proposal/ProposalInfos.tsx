import { Flex, Heading } from "@chakra-ui/react";
import { IconBadge } from "../ui/IconBadge";
import { useMemo } from "react";
import { useProposal } from "./ProposalProvider";
import { TextEditor } from "../ui/TextEditor";
import { Delta } from "quill";
import { useI18nContext } from "@/i18n/i18n-react";

export const ProposalInfos = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();
  const infoVariant = useMemo(() => {
    switch (proposal.status) {
      case "min-not-reached":
        return "rejected";
      default:
        return proposal.status;
    }
  }, [proposal.status]);
  return (
    <>
      <Flex flexDirection={"column"} gap={6} alignItems={"start"}>
        <IconBadge variant={infoVariant} />
        <Heading fontSize={32} fontWeight={600} color="primary.700">
          {proposal.title}
        </Heading>
      </Flex>
      <Flex flexDirection={"column"} gap={4} alignItems={"start"}>
        <Heading fontSize={20} fontWeight={600} color="primary.700">
          {LL.description()}
        </Heading>
        <TextEditor readOnly defaultValue={new Delta(proposal.description)} />
      </Flex>
    </>
  );
};
