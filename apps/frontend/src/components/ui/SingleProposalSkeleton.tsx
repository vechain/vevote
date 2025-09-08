import { Divider, HStack, Skeleton, Stack, VStack, useBreakpointValue } from "@chakra-ui/react";

export const SingleProposalSkeleton = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack gap={10} w={"full"} alignItems={"stretch"}>
      {/* Breadcrumb */}
      <HStack gap={1} alignItems={"center"}>
        <Skeleton height="16px" width="80px" borderRadius="4px" />
        <Skeleton height="16px" width="8px" borderRadius="4px" />
        <Skeleton height="16px" width="60px" borderRadius="4px" />
      </HStack>

      {/* Main content layout */}
      <Stack direction={{ base: "column", md: "row" }} w={"full"} gap={{ base: 10, md: 12 }}>
        {/* Left column - Main content */}
        <VStack gap={10} align="stretch" flex={2}>
          {/* Proposal header */}
          <VStack gap={4} align="stretch">
            <HStack justifyContent={"space-between"} alignItems={{ base: "start", md: "center" }}>
              {/* Status badge */}
              <Skeleton height="28px" width="100px" borderRadius="14px" />

              {/* Proposer info */}
              <HStack gap={2}>
                <Skeleton height="16px" width="20px" borderRadius="4px" />
                <Skeleton height="16px" width="120px" borderRadius="4px" />
                <Skeleton height="24px" width="24px" borderRadius="50%" />
                <Skeleton height="24px" width="1px" />
                <Skeleton height="20px" width="20px" borderRadius="4px" />
              </HStack>
            </HStack>
            <Divider borderColor={"gray.100"} />
          </VStack>

          {/* Proposal title */}
          <VStack gap={2} align="stretch">
            <Skeleton height="28px" width="90%" borderRadius="4px" />
            <Skeleton height="28px" width="70%" borderRadius="4px" />
          </VStack>

          {/* Description section (desktop only) */}
          {!isMobile && (
            <VStack gap={4} align="stretch">
              <Skeleton height="20px" width="100px" borderRadius="4px" />
              <VStack gap={3} align="stretch">
                <Skeleton height="18px" width="100%" borderRadius="4px" />
                <Skeleton height="18px" width="95%" borderRadius="4px" />
                <Skeleton height="18px" width="98%" borderRadius="4px" />
                <Skeleton height="18px" width="85%" borderRadius="4px" />
                <Skeleton height="18px" width="92%" borderRadius="4px" />
                <Skeleton height="18px" width="88%" borderRadius="4px" />
              </VStack>
              <Skeleton height="18px" width="150px" borderRadius="4px" />
            </VStack>
          )}
        </VStack>

        {/* Right column - Voting and timeline */}
        <VStack gap={10} align="stretch" flex={1}>
          {/* Mobile tabs */}
          {isMobile && (
            <HStack borderBottom={"1px solid"} borderColor={"gray.200"}>
              <Skeleton height="40px" flex={1} borderRadius="0" />
              <Skeleton height="40px" flex={1} borderRadius="0" />
            </HStack>
          )}

          {/* Voting card */}
          <VStack gap={6} align="stretch" p={6} border="1px solid" borderColor="gray.200" borderRadius="16px">
            {/* Results section */}
            <ResultSectionSkeleton />

            {/* Submit vote button */}
            <Skeleton height="48px" width="100%" borderRadius="24px" />
          </VStack>

          {/* Timeline card */}
          {!isMobile && (
            <VStack gap={4} align="stretch" p={6} border="1px solid" borderColor="gray.200" borderRadius="16px">
              <HStack gap={2} alignItems="center">
                <Skeleton height="16px" width="16px" borderRadius="50%" />
                <Skeleton height="18px" width="70px" borderRadius="4px" />
              </HStack>

              <VStack gap={3} align="stretch">
                <HStack gap={3} alignItems="center">
                  <Skeleton height="12px" width="12px" borderRadius="50%" />
                  <VStack gap={1} align="start">
                    <Skeleton height="16px" width="60px" borderRadius="4px" />
                    <Skeleton height="14px" width="80px" borderRadius="4px" />
                  </VStack>
                </HStack>

                <HStack gap={3} alignItems="center">
                  <Skeleton height="12px" width="12px" borderRadius="50%" />
                  <VStack gap={1} align="start">
                    <Skeleton height="16px" width="40px" borderRadius="4px" />
                    <Skeleton height="14px" width="90px" borderRadius="4px" />
                  </VStack>
                </HStack>

                <HStack gap={3} alignItems="center">
                  <Skeleton height="12px" width="12px" borderRadius="50%" />
                  <VStack gap={1} align="start">
                    <Skeleton height="16px" width="55px" borderRadius="4px" />
                    <Skeleton height="14px" width="70px" borderRadius="4px" />
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          )}

          {/* Mobile description section */}
          {isMobile && (
            <VStack gap={4} align="stretch">
              <Skeleton height="20px" width="100px" borderRadius="4px" />
              <VStack gap={3} align="stretch">
                <Skeleton height="18px" width="100%" borderRadius="4px" />
                <Skeleton height="18px" width="95%" borderRadius="4px" />
                <Skeleton height="18px" width="98%" borderRadius="4px" />
                <Skeleton height="18px" width="85%" borderRadius="4px" />
              </VStack>
              <Skeleton height="18px" width="150px" borderRadius="4px" />
            </VStack>
          )}
        </VStack>
      </Stack>

      {/* Buy node CTA */}
      <HStack p={4} bg="gray.50" borderRadius="12px" justifyContent="space-between" alignItems="center">
        <HStack gap={3}>
          <Skeleton height="20px" width="20px" borderRadius="50%" />
          <Skeleton height="18px" width="300px" borderRadius="4px" />
        </HStack>
        <Skeleton height="40px" width="120px" borderRadius="20px" />
      </HStack>
    </VStack>
  );
};

export const ResultSectionSkeleton = () => {
  return (
    <VStack gap={4} align="stretch">
      <HStack gap={2} alignItems="center">
        <Skeleton height="16px" width="16px" borderRadius="50%" />
        <Skeleton height="18px" width="60px" borderRadius="4px" />
      </HStack>

      <HStack gap={4} justifyContent="space-between">
        <HStack gap={2}>
          <Skeleton height="20px" width="20px" borderRadius="4px" />
          <Skeleton height="16px" width="40px" borderRadius="4px" />
        </HStack>
        <HStack gap={2}>
          <Skeleton height="20px" width="20px" borderRadius="50%" />
          <Skeleton height="16px" width="40px" borderRadius="4px" />
        </HStack>
        <HStack gap={2}>
          <Skeleton height="20px" width="20px" borderRadius="4px" />
          <Skeleton height="16px" width="40px" borderRadius="4px" />
        </HStack>
      </HStack>

      <Skeleton height="14px" width="100%" borderRadius="4px" />
    </VStack>
  );
};
