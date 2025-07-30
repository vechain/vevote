import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { CircleXIcon } from "@/icons";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";

export const CanceledProposal = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();
  const { formattedProposalDate } = useFormatDate();

  // Use endDate or createdAt as fallback for the cancellation date
  const cancellationDate = proposal.canceledDate || new Date();
  const formattedDate = formattedProposalDate(cancellationDate);

  return (
    <Flex
      borderWidth={2}
      borderColor="red.200"
      backgroundColor="red.50"
      borderRadius={12}
      paddingY={6}
      paddingX={6}
      width="full"
      flexDirection="column"
      gap={4}>
      {/* Header with icon and title */}
      <Flex alignItems="center" gap={3}>
        <Icon as={CircleXIcon} color="red.500" boxSize={6} />
        <Text fontSize={{ base: "18px", md: "20px" }} fontWeight={600} color="red.700">
          {LL.proposal.proposal_canceled()}
        </Text>
      </Flex>

      {/* Date */}
      {formattedDate && (
        <Text fontSize={{ base: "14px", md: "16px" }} color="red.600">
          {formattedDate}
        </Text>
      )}

      {/* Description */}
      <VStack align="stretch" gap={3}>
        <Text fontSize={{ base: "14px", md: "16px" }} color="red.700">
          {LL.proposal.proposal_canceled_description()}
        </Text>

        {/* Reason box */}
        <Box backgroundColor="gray.100" borderRadius={8} padding={4} minHeight="60px">
          <Text fontSize={{ base: "14px", md: "16px" }} color="gray.600">
            {proposal.reason || LL.proposal.no_reason_provided()}
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
};
