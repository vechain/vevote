import { useI18nContext } from "@/i18n/i18n-react";
import { Flex, Text } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { TextEditor } from "@/components/ui/TextEditor";
import { Delta } from "quill";

export const DescriptionSection = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();

  return (
    <Flex flexDirection={"column"} gap={6} alignItems={"start"} width={"full"}>
      <Text fontSize={{ base: "14px", md: "20px" }} fontWeight={600} color="primary.700">
        {LL.description()}
      </Text>
      <TextEditor readOnly defaultValue={new Delta(proposal.description)} />
    </Flex>
  );
};
