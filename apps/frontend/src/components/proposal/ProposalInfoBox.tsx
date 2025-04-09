import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoArrowForward } from "react-icons/io5";
import { InfoBox, infoBoxVariants } from "../ui/InfoBox";
import { useProposal } from "./ProposalProvider";

type ProposalInfoBoxProps = {
  proposalId?: string;
  canceledDate?: Date;
  canceledReason?: string;
};

export const ProposalInfoBox = ({ canceledDate, canceledReason, proposalId }: ProposalInfoBoxProps) => {
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
      {proposalId && (
        <Button alignSelf={"center"} gap={2}>
          {LL.see_details()}
          <IoArrowForward />
        </Button>
      )}
      {canceledDate && <Text>{formattedProposalDate(canceledDate)}</Text>}
    </InfoBox>
  );
};
