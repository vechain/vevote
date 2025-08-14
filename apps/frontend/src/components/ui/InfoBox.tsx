import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowLinkIcon, CancelIcon, CheckCircleIcon, CheckDoubleIcon, CircleInfoIcon, CircleXIcon } from "@/icons";
import { Box, Button, defineStyle, Flex, FlexProps, Icon, Link, Text } from "@chakra-ui/react";

export type InfoBoxProps = FlexProps & {
  variant: "info" | "approved" | "executed" | "min-not-reached" | "rejected" | "canceled";
};

export const infoBoxVariants = {
  info: {
    icon: CircleInfoIcon,
    style: defineStyle({
      borderColor: "blue.200",
      backgroundColor: "blue.50",
      color: "blue.700",
    }),
  },
  approved: {
    icon: CheckCircleIcon,
    style: defineStyle({
      borderColor: "green.200",
      backgroundColor: "green.50",
      color: "green.500",
    }),
  },
  executed: {
    icon: CheckDoubleIcon,
    style: defineStyle({
      borderColor: "green.200",
      backgroundColor: "green.50",
      color: "green.500",
    }),
  },
  "min-not-reached": {
    icon: CircleXIcon,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "red.50",
      color: "red.500",
    }),
  },
  rejected: {
    icon: CircleXIcon,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "red.50",
      color: "red.500",
    }),
  },
  canceled: {
    icon: CancelIcon,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "gray.100",
      color: "red.500",
    }),
  },
};

export const InfoBox = ({ children, variant, ...restProps }: InfoBoxProps) => {
  return (
    <Flex
      borderColor={infoBoxVariants[variant].style.borderColor}
      backgroundColor={infoBoxVariants[variant].style.backgroundColor}
      borderRadius={12}
      borderWidth={2}
      padding={4}
      width={"100%"}
      gap={3}
      {...restProps}>
      <Icon
        marginTop={0.5}
        as={infoBoxVariants[variant].icon}
        color={infoBoxVariants[variant].style.color}
        boxSize={4}
      />
      {children}
    </Flex>
  );
};

export const CanceledInfoBox = ({ reason, date }: { reason?: string; date?: string }) => {
  const { LL } = useI18nContext();
  return (
    <Flex
      borderColor={infoBoxVariants["canceled"].style.borderColor}
      backgroundColor={infoBoxVariants["canceled"].style.backgroundColor}
      borderRadius={12}
      borderWidth={2}
      padding={4}
      width={"100%"}
      flexDirection="column"
      alignItems="start"
      gap={3}
      color={"gray.600"}>
      <Flex alignItems="center" gap={3}>
        <Icon as={infoBoxVariants["canceled"].icon} color={infoBoxVariants["canceled"].style.color} boxSize={4} />
        <Text fontSize={"14px"} fontWeight={500} color="red.700">
          {LL.proposal.info_box.canceled.title()}
        </Text>
      </Flex>
      {date && (
        <Text fontSize={"12px"} fontWeight={500}>
          {date}
        </Text>
      )}
      <Text fontSize={"12px"}>{LL.proposal.info_box.canceled.description()}</Text>
      <Box backgroundColor="gray.200" borderRadius={8} paddingX={4} paddingY={3} w={"full"}>
        <Text fontSize={"12px"} color="gray.600">
          {reason || LL.proposal.no_reason_provided()}
        </Text>
      </Box>
    </Flex>
  );
};

export const ExecutedInfoBox = ({ executedProposalLink }: { executedProposalLink?: string }) => {
  const { LL } = useI18nContext();

  return (
    <Flex
      borderColor={infoBoxVariants["executed"].style.borderColor}
      backgroundColor={infoBoxVariants["executed"].style.backgroundColor}
      borderRadius={12}
      borderWidth={2}
      padding={4}
      width={"100%"}
      flexDirection="column"
      alignItems="start"
      gap={3}
      color={"gray.600"}>
      <Flex alignItems="center" gap={3}>
        <Icon as={infoBoxVariants["executed"].icon} color={infoBoxVariants["executed"].style.color} boxSize={4} />
        <Text fontSize={"14px"} fontWeight={500} color="green.700">
          {LL.proposal.proposal_approved_and_executed()}
        </Text>
      </Flex>

      <Text fontSize={"12px"}>{LL.proposal.the_voting_approved_the_proposal_and_the_actions_have_been_executed()}</Text>
      {executedProposalLink && (
        <Button
          as={Link}
          size={"sm"}
          variant={"secondary"}
          rightIcon={<Icon as={ArrowLinkIcon} />}
          href={executedProposalLink}
          alignSelf={"flex-end"}
          isExternal>
          {LL.proposal.see_details()}
        </Button>
      )}
    </Flex>
  );
};
