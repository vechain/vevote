import { useHasVoted } from "@/hooks/useCastVote";
import { useNodes } from "@/hooks/useUserQueries";
import { useVotesSectionCalculations } from "@/hooks/useVotesSectionCalculations";
import { useI18nContext } from "@/i18n/i18n-react";
import { VotingPowerIcon } from "@/icons";
import { VotedResult } from "@/types/votes";
import { Box, Button, defineStyle, Flex, Icon, Radio, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import { useProposal } from "./ProposalProvider";

export type VotingItemVariant = "upcoming" | "voting" | "result-lost" | "result-win";

export type VotingItemProps = {
  label: string;
  isSelected: boolean;
  variant: VotingItemVariant;
  choiceIndex: number;
  onClick?: () => void;
  results?: VotedResult;
};

type VotingItemHeaderProps = Omit<VotingItemProps, "choiceIndex" | "results"> & {
  isVoter?: boolean;
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

export const VotingItem = ({ isSelected, label, variant, onClick, choiceIndex, results }: VotingItemProps) => {
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
      variant={"none"}
      _focus={{ boxShadow: "none" }}
      transition={"all 0.2s"}
      height={"100%"}
      display={"flex"}
      width={"100%"}
      padding={{ base: 4, md: 6 }}
      borderRadius={12}
      flexDirection={"column"}
      gap={4}
      onClick={handleClick}
      {...variants(isSelected)[variant]}>
      <Flex gap={2} alignItems={"start"} width={"100%"} flexDirection={"column"}>
        <VotingItemHeader label={label} variant={variant} isSelected={isSelected} isVoter={isVoter} />
        {variant !== "upcoming" && (
          <VotesSection choiceIndex={choiceIndex} variant={variant} isSelected={isSelected} results={results} />
        )}
      </Flex>
    </Button>
  );
};

const VotingItemHeader = ({ label, variant, isSelected, isVoter }: VotingItemHeaderProps) => {
  const showCheckRadio = useMemo(() => isVoter && variant !== "result-lost", [isVoter, variant]);
  return (
    <Flex gap={2} alignItems={"center"} justifyContent={"space-between"} width={"100%"} flex={1}>
      <Text fontSize={{ base: 14, md: 18 }} fontWeight={600} color={variant === "upcoming" ? "gray.400" : "gray.600"}>
        {label}
      </Text>
      <Flex gap={4} alignItems={"center"}>
        {showCheckRadio && <Radio isChecked={isSelected} />}
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

  const { voterCount, votesPercentage } = useVotesSectionCalculations({
    results,
    choiceIndex,
  });

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
