import { useI18nContext } from "@/i18n/i18n-react";
import { VotingEnum } from "@/types/proposal";
import { Box, Button, Checkbox, defineStyle, Flex, Icon, Radio, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@vechain/vechain-kit";
import { useHasVoted } from "@/hooks/useCastVote";
import { useProposal } from "./ProposalProvider";
import { useNodes } from "@/hooks/useUserQueries";
import { VotedResult } from "@/types/votes";
import { VotingPowerIcon } from "@/icons";

export type VotingItemVariant = "upcoming" | "voting" | "result-lost" | "result-win";

export type VotingItemProps = {
  label: string;
  isSelected: boolean;
  kind: VotingEnum;
  variant: VotingItemVariant;
  choiceIndex: number;
  onClick?: () => void;
  isMostVoted?: boolean;
  results?: VotedResult;
};

const variants = (isSelected: boolean) => ({
  upcoming: defineStyle({
    bg: "gray.100",
    borderColor: "gray.200",
    borderWidth: 2,
  }),
  voting: defineStyle({
    bg: "white",
    borderColor: isSelected ? "primary.500" : "gray.200",
    borderWidth: 2,
  }),
  "result-lost": defineStyle({
    bg: isSelected ? "gray.100" : "white",
    borderColor: isSelected ? "gray.500" : "transparent",
    borderWidth: 2,
  }),
  "result-win": defineStyle({
    bg: isSelected ? "primary.100" : "white",
    borderColor: isSelected ? "primary.500" : "transparent",
    borderWidth: 3,
  }),
});

export const VotingItem = ({
  isSelected,
  kind,
  label,
  variant,
  onClick,
  isMostVoted,
  choiceIndex,
  results,
}: VotingItemProps) => {
  const { connection } = useWallet();
  const { proposal } = useProposal();
  const { hasVoted } = useHasVoted({ proposalId: proposal.id });
  const { nodes } = useNodes({ startDate: proposal?.startDate });
  const isVoter = useMemo(() => nodes.length > 0, [nodes.length]);

  const cannotVote = useMemo(
    () => !connection.isConnected || hasVoted || variant !== "voting" || !isVoter,
    [connection.isConnected, hasVoted, isVoter, variant],
  );
  const handleClick = useCallback(() => {
    if (cannotVote) return;
    onClick?.();
  }, [cannotVote, onClick]);
  return (
    <Button
      variant={"tertiary"}
      _focus={{ boxShadow: "none" }}
      transition={"all 0.2s"}
      height={"100%"}
      display={"flex"}
      width={"100%"}
      padding={6}
      borderRadius={12}
      flexDirection={"column"}
      gap={4}
      onClick={handleClick}
      {...variants(isSelected)[variant]}>
      <Flex gap={2} alignItems={"center"} width={"100%"} flexDirection={"column"}>
        <VotingItemHeader
          label={label}
          isMostVoted={isMostVoted}
          kind={kind}
          variant={variant}
          isSelected={isSelected}
        />
        {variant !== "upcoming" && (
          <VotesSection choiceIndex={choiceIndex} variant={variant} isSelected={isSelected} results={results} />
        )}
      </Flex>
    </Button>
  );
};

const VotingItemHeader = ({ label, isMostVoted, kind, variant, isSelected }: Omit<VotingItemProps, "choiceIndex">) => {
  const { LL } = useI18nContext();
  return (
    <Flex gap={2} alignItems={"center"} justifyContent={"space-between"} width={"100%"} flex={1}>
      <Text fontSize={{ base: 14, md: 18 }} fontWeight={600} color={variant === "upcoming" ? "gray.400" : "gray.600"}>
        {label}
      </Text>
      <Flex gap={4} alignItems={"center"}>
        {isMostVoted && (
          <Text paddingX={3} paddingY={1} fontWeight={500} color={"primary.700"} bg={"primary.200"} borderRadius={6}>
            {LL.most_voted()}
          </Text>
        )}

        {[VotingEnum.SINGLE_OPTION, VotingEnum.SINGLE_CHOICE].includes(kind) ? (
          <Radio isChecked={isSelected} />
        ) : (
          <Checkbox isChecked={isSelected} />
        )}
      </Flex>
    </Flex>
  );
};

const VotesSection = ({
  choiceIndex,
  isSelected,
  variant,
  results,
}: {
  choiceIndex: number;
  variant: VotingItemVariant;
  isSelected: boolean;
  results?: VotedResult;
}) => {
  const isProgressDisabled = useMemo(() => variant === "voting" && !isSelected, [variant, isSelected]);
  const { LL } = useI18nContext();

  const choiceWeight = useMemo(() => {
    if (!results) return 0;
    const matchingResult = results.data.find(r => r.choice === choiceIndex);
    return matchingResult?.totalWeight ?? 0;
  }, [choiceIndex, results]);

  const totalWeight = useMemo(() => {
    if (!results) return 0;
    return results.data.reduce((sum, result) => sum + (result.totalWeight ?? 0), 0);
  }, [results]);

  const voterCount = useMemo(() => {
    if (!results) return 0;
    const matchingResult = results.data.find(r => r.choice === choiceIndex);
    return matchingResult?.totalVoters ?? 0;
  }, [choiceIndex, results]);

  const votesPercentage = useMemo(() => {
    if (totalWeight === 0) return 0;
    return (choiceWeight / totalWeight) * 100;
  }, [choiceWeight, totalWeight]);

  return (
    <Flex gap={{ base: 3, md: 10 }} alignItems={"center"} justifyContent={"space-between"} width={"100%"}>
      <Text fontWeight={500} color={"gray.500"} fontSize={{ base: 12, md: 16 }}>{`${voterCount} ${LL.votes()}`}</Text>
      <ProgressBar votesPercentage={votesPercentage} isDisable={isProgressDisabled} />
      <Flex gap={2} alignItems={"center"}>
        <Text fontWeight={500} color={"gray.500"} fontSize={{ base: 12, md: 16 }}>
          {parseInt(votesPercentage.toString())} {LL.percentage()}
        </Text>
        <Icon as={VotingPowerIcon} color={"gray.500"} boxSize={{ base: 3, md: 5 }} />
      </Flex>
    </Flex>
  );
};

const ProgressBar = ({ votesPercentage, isDisable }: { votesPercentage: number; isDisable: boolean }) => {
  return (
    <Box flex={1} height={{ base: 2, md: 4 }} backgroundColor={"gray.200"} borderRadius={4}>
      <motion.div
        style={{ borderRadius: 4, backgroundColor: isDisable ? "#AAAFB6" : "#6042DD", height: "100%" }}
        initial={{ width: "0%" }}
        animate={{ width: `${votesPercentage}%` }}
      />
    </Box>
  );
};
