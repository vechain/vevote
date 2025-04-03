import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { GoCheckCircle, GoXCircle } from "react-icons/go";
import { FcCancel } from "react-icons/fc";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { IoArrowForward } from "react-icons/io5";

type InfoBoxProps = {
  variant: "info" | "approved" | "executed" | "min-not-reached" | "rejected" | "canceled";
  proposalId?: string;
  canceledDate?: Date;
  canceledReason?: string;
};

export const InfoBox = ({ variant, canceledDate, canceledReason, proposalId }: InfoBoxProps) => {
  const { LL } = useI18nContext();
  const { formattedProposalDate } = useFormatDate();
  const contentVariant = useMemo(
    () => [
      {
        variant: "info",
        title: "Minimum participation",
        description:
          "A minimum of 30% participation must be reached to validate the voting of the proposal and get approval.",
        icon: IoIosInformationCircleOutline,
        style: {
          borderColor: "blue.200",
          backgroundColor: "blue.50",
          color: "blue.700",
        },
      },
      {
        variant: "approved",
        title: "Minimum participation reached",
        description: "The voting participation reached the minimum required of 30% to get approval.",
        icon: GoCheckCircle,
        style: {
          borderColor: "green.200",
          backgroundColor: "green.50",
          color: "green.700",
        },
      },
      {
        variant: "executed",
        title: "Proposal Approved and Executed",
        description: "The voting approved the proposal and the actions have been executed.",
        icon: GoCheckCircle,
        style: {
          borderColor: "green.200",
          backgroundColor: "green.50",
          color: "green.700",
        },
      },
      {
        variant: "min-not-reached",
        title: "Minimum participation not reached",
        description: "The voting participation didn’t reached the minimum required of 30% to get approval.",
        icon: FcCancel,
        style: {
          borderColor: "red.200",
          backgroundColor: "red.50",
          color: "red.700",
        },
      },
      {
        variant: "rejected",
        title: "Proposal Rejected",
        description: "The proposal didn’t get enough votes in favor to get approval.",
        icon: GoXCircle,
        style: {
          borderColor: "red.200",
          backgroundColor: "red.50",
          color: "red.700",
        },
      },
      {
        variant: "canceled",
        title: "Proposal Canceled",
        description: "The proposal was canceled by VeChain or the proposer by the following reason:",
        icon: GoXCircle,
        style: {
          borderColor: "red.200",
          backgroundColor: "gray.100",
          color: "red.700",
        },
      },
    ],
    [],
  );

  const selectedVariant = useMemo(
    () => contentVariant.find(item => item.variant === variant),
    [variant, contentVariant],
  );

  return (
    <Box
      borderColor={selectedVariant?.style.borderColor}
      backgroundColor={selectedVariant?.style.backgroundColor}
      borderRadius={12}
      borderWidth={2}
      paddingY={4}
      paddingX={6}
      width={"100%"}>
      <Flex gap={3}>
        <Icon as={selectedVariant?.icon} color={selectedVariant?.style.color} />
        <Flex flex={1} flexDirection={"column"} gap={1}>
          <Heading fontSize={18} fontWeight={500} color={selectedVariant?.style.color}>
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
      </Flex>
    </Box>
  );
};
