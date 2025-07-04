import { useI18nContext } from "@/i18n/i18n-react";
import { InfoBox, infoBoxVariants } from "../ui/InfoBox";
import { useFormatDate } from "@/hooks/useFormatDate";
import { MouseEventHandler, useMemo } from "react";
import { Button, ButtonProps, Flex, Icon, Link, Text, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton, useWallet } from "@vechain/vechain-kit";
import { VotingItemVariant } from "./VotingItem";
import { useProposal } from "./ProposalProvider";
import { getVotingVariant } from "@/utils/voting";
import { VotingPowerModal } from "./VotingPowerModal";
import { VotersModal } from "./VotersModal";
import { useHasVoted } from "@/hooks/useCastVote";
import { ArrowLinkIcon, ArrowRightIcon, CheckCircleIcon } from "@/icons";
import { useNodes } from "@/hooks/useUserQueries";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";

type VotingListFooterProps = { onSubmit: () => Promise<void>; isLoading?: boolean; disabled?: boolean };

export const VotingListFooter = ({ onSubmit, isLoading, disabled = false }: VotingListFooterProps) => {
  const { proposal } = useProposal();
  const { connection } = useWallet();
  const { LL } = useI18nContext();
  const { formattedProposalDate } = useFormatDate();
  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);
  const { nodes } = useNodes({ startDate: proposal?.startDate });
  const isVoter = useMemo(() => nodes.length > 0, [nodes.length]);

  const votingNotStarted = useMemo(
    () => proposal.status === "upcoming" || (proposal.status === "voting" && !connection.isConnected),
    [proposal.status, connection.isConnected],
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
      <VotingFooterAction
        onSubmit={onSubmit}
        votingVariant={votingVariant}
        isLoading={isLoading}
        isVoter={isVoter}
        disabled={disabled}
      />
      {/* add error */}
      {!votingNotStarted && isVoter && <VotingPower />}
    </Flex>
  );
};

const VotingFooterAction = ({
  onSubmit,
  votingVariant,
  isLoading,
  isVoter = false,
  disabled = false,
}: {
  onSubmit: () => void;
  votingVariant: VotingItemVariant;
  isLoading?: boolean;
  isVoter?: boolean;
  disabled?: boolean;
}) => {
  const { connection } = useWallet();
  const { proposal } = useProposal();
  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });

  if (!connection.isConnected && votingVariant === "voting") return <ConnectButton />;

  switch (votingVariant) {
    case "voting": {
      if (!isVoter) return;
      return hasVoted ? <VotedChip /> : <VotingSubmit onClick={onSubmit} isLoading={isLoading} disabled={disabled} />;
    }
    case "result-win":
    case "result-lost":
      return <VotersModal />;
  }
};

const VotingSubmit = ({ onClick, ...rest }: ButtonProps) => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();

  const handleClick: MouseEventHandler<HTMLButtonElement> = e => {
    trackEvent(MixPanelEvent.CTA_VOTE_CLICKED, {
      proposalId: proposal?.id || "",
      voteOption: "submit",
    });
    onClick?.(e);
  };

  return (
    <Button rightIcon={<Icon as={ArrowRightIcon} />} onClick={handleClick} {...rest}>
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

const VotingPower = () => {
  const { LL } = useI18nContext();
  return (
    <Flex alignItems={"center"} gap={3}>
      <Text fontSize={12} fontWeight={600} color={"gray.500"}>
        {LL.voting_power()}
      </Text>
      <VotingPowerModal />
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
