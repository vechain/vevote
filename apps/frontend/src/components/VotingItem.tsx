import { useI18nContext } from "@/i18n/i18n-react";
import { VotingEnum } from "@/types/proposal";
import { Box, Button, Checkbox, defineStyle, Flex, Radio, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";

type VotingItemVariant = "upcoming" | "voting" | "result-lost" | "result-win";

type VotingItemProps = {
  label: string;
  isSelected: boolean;
  kind: VotingEnum;
  variant: VotingItemVariant;
  votes: number;
  onClick?: () => void;
  isMostVoted?: boolean;
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
    bg: "white",
    borderColor: isSelected ? "gray.500" : "transparent",
    borderWidth: 2,
  }),
  "result-win": defineStyle({
    bg: "primary.100",
    borderColor: isSelected ? "primary.500" : "transparent",
    borderWidth: 3,
  }),
});

export const VotingItem = ({ isSelected, kind, label, variant, onClick, isMostVoted, votes }: VotingItemProps) => {
  const handleClick = useCallback(() => {
    if (variant === "voting") onClick?.();
  }, [onClick, variant]);
  return (
    <Button
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
        {variant !== "upcoming" && <VotesSection votes={votes} variant={variant} isSelected={isSelected} />}
      </Flex>
    </Button>
  );
};

const VotingItemHeader = ({ label, isMostVoted, kind, variant, isSelected }: Omit<VotingItemProps, "votes">) => {
  const { LL } = useI18nContext();
  return (
    <Flex gap={2} alignItems={"center"} justifyContent={"space-between"} width={"100%"} flex={1}>
      <Text fontSize={18} fontWeight={600} color={variant === "upcoming" ? "gray.400" : "gray.600"}>
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
  votes,
  isSelected,
  variant,
}: {
  votes: number;
  variant: VotingItemVariant;
  isSelected: boolean;
}) => {
  const isProgressDisabled = useMemo(() => variant === "voting" && !isSelected, [variant, isSelected]);
  const { LL } = useI18nContext();
  const votesPercentage = useMemo(() => (votes / 100) * 100, [votes]);
  return (
    <Flex gap={10} alignItems={"center"} justifyContent={"space-between"} width={"100%"}>
      <Text fontWeight={500} color={"gray.500"}>
        {votes} {LL.votes()}
      </Text>
      <ProgressBar votesPercentage={votesPercentage} isDisable={isProgressDisabled} />
      <Text fontWeight={500} color={"gray.500"}>
        {parseInt(votesPercentage.toString())} {LL.percentage()}
      </Text>
    </Flex>
  );
};

const ProgressBar = ({ votesPercentage, isDisable }: { votesPercentage: number; isDisable: boolean }) => {
  return (
    <Box flex={1} height={4} backgroundColor={"gray.200"} borderRadius={4}>
      <motion.div
        style={{ borderRadius: 4, backgroundColor: isDisable ? "#AAAFB6" : "#6042DD", height: "100%" }}
        initial={{ width: "0%" }}
        animate={{ width: `${votesPercentage}%` }}
      />
    </Box>
  );
};
