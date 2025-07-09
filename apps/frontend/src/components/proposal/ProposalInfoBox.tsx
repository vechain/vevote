import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, Heading, Icon, Link, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { InfoBox, infoBoxVariants } from "../ui/InfoBox";
import { useProposal } from "./ProposalProvider";
import { ArrowLinkIcon } from "@/icons";
import { useQuorum } from "@/hooks/useQuorum";

type ProposalInfoBoxProps = {
  canceledDate?: Date;
  canceledReason?: string;
};

export const ProposalInfoBox = ({ canceledDate, canceledReason }: ProposalInfoBoxProps) => {
  const { proposal } = useProposal();
  const { LL } = useI18nContext();
  const { formattedProposalDate } = useFormatDate();
  const { quorumPercentage } = useQuorum();

  const contentVariant = useMemo(
    () =>
      Object.entries(LL.proposal.info_box).map(([key, value]) => ({
        variant: key,
        title: value.title(),
        description: value.description({ quorum: quorumPercentage || 0 }),
      })),
    [LL.proposal.info_box, quorumPercentage],
  );

  const variant = useMemo(() => {
    switch (proposal.status) {
      case "voting":
      case "upcoming":
      case "draft":
        return "info";
      default:
        return proposal.status;
    }
  }, [proposal.status]);

  const selectedVariant = useMemo(
    () => contentVariant.find(item => item.variant === variant),
    [variant, contentVariant],
  );

  return (
    <InfoBox variant={variant}>
      <Flex flex={1} flexDirection={"column"} gap={1} overflow={"hidden"}>
        <Heading fontSize={{ base: 14, md: 18 }} fontWeight={500} color={infoBoxVariants[variant].style.color}>
          {selectedVariant?.title}
        </Heading>
        <Text fontSize={{ base: 12, md: 14 }} color={"gray.600"}>
          {selectedVariant?.description}
        </Text>
        {canceledReason && (
          <Text
            fontSize={{ base: 12, md: 14 }}
            color={"gray.600"}
            paddingY={2}
            paddingX={4}
            bg={"gray.200"}
            marginTop={4}
            borderRadius={8}
            noOfLines={3}>
            {canceledReason}
          </Text>
        )}
        {variant === "executed" && proposal.executedProposalLink && (
          <Button
            as={Link}
            mt={2}
            display={{ base: "flex", md: "none" }}
            size={"md"}
            variant={"secondary"}
            alignSelf={"start"}
            gap={2}
            rightIcon={<Icon as={ArrowLinkIcon} />}
            href={proposal.executedProposalLink}
            isExternal>
            {LL.see_details()}
          </Button>
        )}
      </Flex>
      {variant === "executed" && proposal.executedProposalLink && (
        <Button
          as={Link}
          display={{ base: "none", md: "flex" }}
          variant={"secondary"}
          gap={2}
          rightIcon={<Icon as={ArrowLinkIcon} />}
          href={proposal.executedProposalLink}
          isExternal>
          {LL.see_details()}
        </Button>
      )}
      {canceledDate && <Text>{formattedProposalDate(canceledDate)}</Text>}
    </InfoBox>
  );
};
