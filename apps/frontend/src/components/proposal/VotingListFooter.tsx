import { useI18nContext } from "@/i18n/i18n-react";
import { InfoBox, infoBoxVariants } from "../ui/InfoBox";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useMemo } from "react";
import { Button, ButtonProps, Flex, Icon, Link, Text, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton, useWallet } from "@vechain/vechain-kit";
import { VotingItemVariant } from "./VotingItem";
import { useProposal } from "./ProposalProvider";
import { getVotingVariant } from "@/utils/voting";
import { VotingPowerModal } from "./VotingPowerModal";
import { VotersModal } from "./VotersModal";
import { useHasVoted } from "@/hooks/useCastVote";
import { ArrowLinkIcon, ArrowRightIcon, CheckCircleIcon } from "@/icons";

export const VotingListFooter = ({ onSubmit, isLoading }: { onSubmit: () => Promise<void>; isLoading?: boolean }) => {
  const { proposal } = useProposal();
  const { account } = useWallet();
  const { LL } = useI18nContext();
  const { formattedProposalDate } = useFormatDate();
  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const votingNotStarted = useMemo(
    () => proposal.status === "upcoming" || (proposal.status === "voting" && !account?.address),
    [proposal.status, account?.address],
  );

  if (votingVariant === "upcoming")
    return (
      <InfoBox variant="info">
        <Text fontSize={14} color={infoBoxVariants["info"].style.color}>
          {LL.proposal.voting_will_start({ date: formattedProposalDate(proposal.startDate) || "" })}
        </Text>
      </InfoBox>
    );
  return (
    <Flex gap={8} alignItems={"center"} justifyContent={"space-between"} width={"100%"}>
      <VotingFooterAction onSubmit={onSubmit} votingVariant={votingVariant} isLoading={isLoading} />
      {/* add error */}
      {!votingNotStarted && <VotingPower votingPower={300} />}
    </Flex>
  );
};

const VotingFooterAction = ({
  onSubmit,
  votingVariant,
  isLoading,
}: {
  onSubmit: () => void;
  votingVariant: VotingItemVariant;
  isLoading?: boolean;
}) => {
  const { account } = useWallet();
  const { proposal } = useProposal();
  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });

  if (!account?.address) return <ConnectButton />;

  switch (votingVariant) {
    case "voting":
      return hasVoted ? <VotedChip /> : <VotingSubmit onClick={onSubmit} isLoading={isLoading} />;
    case "result-win":
      return <VotedChip />;
    case "result-lost":
      return <VotersModal />;
  }
};

const VotingSubmit = (props: ButtonProps) => {
  const { LL } = useI18nContext();
  return (
    <Button rightIcon={<Icon as={ArrowRightIcon} />} {...props}>
      {LL.submit()}
    </Button>
  );
};

const VotedChip = () => {
  const { LL } = useI18nContext();
  //TODO: see your vote modal
  return (
    <Flex alignItems={"center"} gap={3}>
      <Button variant={"feedback"} rightIcon={<Icon as={CheckCircleIcon} />}>
        {LL.voted()}
      </Button>
      <Link color={"primary.500"} display={"flex"} gap={1} alignItems={"center"}>
        {LL.proposal.see_your_vote()}
        <Icon as={ArrowLinkIcon} width={4} height={4} />
      </Link>
    </Flex>
  );
};

const VotingPower = ({ votingPower }: { votingPower: number }) => {
  const { LL } = useI18nContext();
  return (
    <Flex alignItems={"center"} gap={3}>
      <Text fontSize={12} fontWeight={600} color={"gray.500"}>
        {LL.voting_power()}
      </Text>
      <VotingPowerModal votingPower={votingPower} />
    </Flex>
  );
};

const ConnectButton = () => {
  return (
    <DAppKitWalletButton
      mobile={useBreakpointValue({
        base: true,
        md: false,
      })}
    />
  );
};
