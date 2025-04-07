import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoArrowForward } from "react-icons/io5";
import { InfoBox, InfoBoxProps, infoBoxVariants } from "./ui/InfoBox";

type ProposalInfoBoxProps = {
  variant: InfoBoxProps["variant"];
  proposalId?: string;
  canceledDate?: Date;
  canceledReason?: string;
};

export const ProposalInfoBox = ({ variant, canceledDate, canceledReason, proposalId }: ProposalInfoBoxProps) => {
  const { LL } = useI18nContext();
  const { formattedProposalDate } = useFormatDate();
  // todo: add localization
  const contentVariant = useMemo(
    () => [
      {
        variant: "info",
        title: "Minimum participation",
        description:
          "A minimum of 30% participation must be reached to validate the voting of the proposal and get approval.",
      },
      {
        variant: "approved",
        title: "Minimum participation reached",
        description: "The voting participation reached the minimum required of 30% to get approval.",
      },
      {
        variant: "executed",
        title: "Proposal Approved and Executed",
        description: "The voting approved the proposal and the actions have been executed.",
      },
      {
        variant: "min-not-reached",
        title: "Minimum participation not reached",
        description: "The voting participation didn’t reached the minimum required of 30% to get approval.",
      },
      {
        variant: "rejected",
        title: "Proposal Rejected",
        description: "The proposal didn’t get enough votes in favor to get approval.",
      },
      {
        variant: "canceled",
        title: "Proposal Canceled",
        description: "The proposal was canceled by VeChain or the proposer by the following reason:",
      },
    ],
    [],
  );

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
