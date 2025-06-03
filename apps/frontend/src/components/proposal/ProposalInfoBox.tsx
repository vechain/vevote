import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { InfoBox, infoBoxVariants } from "../ui/InfoBox";
import { useProposal } from "./ProposalProvider";
import { ArrowLinkIcon } from "@/icons";

type ProposalInfoBoxProps = {
  canceledDate?: Date;
  canceledReason?: string;
};

export const ProposalInfoBox = ({ canceledDate, canceledReason }: ProposalInfoBoxProps) => {
  const { proposal } = useProposal();
  const { LL } = useI18nContext();
  const { formattedProposalDate } = useFormatDate();

  const contentVariant = useMemo(
    () =>
      Object.entries(LL.proposal.info_box).map(([key, value]) => ({
        variant: key,
        title: value.title(),
        description: value.description(),
      })),
    [LL.proposal.info_box],
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
      <Flex flex={1} flexDirection={"column"} gap={1}>
        <Heading fontSize={18} fontWeight={500} color={infoBoxVariants[variant].style.color}>
          {selectedVariant?.title}
        </Heading>
        <Text fontSize={14} color={"gray.600"}>
          {selectedVariant?.description}
        </Text>
        {canceledReason && (
          <Text
            fontSize={14}
            color={"gray.600"}
            paddingY={3}
            paddingX={4}
            bg={"gray.200"}
            marginTop={4}
            borderRadius={8}>
            {canceledReason}
          </Text>
        )}
      </Flex>
      {variant === "executed" && (
        <Button variant={"secondary"} alignSelf={"center"} gap={2} rightIcon={<Icon as={ArrowLinkIcon} />}>
          {LL.see_details()}
        </Button>
      )}
      {canceledDate && <Text>{formattedProposalDate(canceledDate)}</Text>}
    </InfoBox>
  );
};
