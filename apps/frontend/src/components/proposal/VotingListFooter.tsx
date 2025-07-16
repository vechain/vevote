import { useI18nContext } from "@/i18n/i18n-react";
import { InfoBox, infoBoxVariants } from "../ui/InfoBox";
import { useFormatDate } from "@/hooks/useFormatDate";
import { MouseEventHandler, useMemo } from "react";
import { Button, ButtonProps, Flex, Icon, Link, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { VotingItemVariant } from "./VotingItem";
import { useProposal } from "./ProposalProvider";
import { getVotingVariant } from "@/utils/voting";
import { VotingPowerModal } from "./VotingPowerModal";
import { VotersModal } from "./VotersModal";
import { useHasVoted } from "@/hooks/useCastVote";
import { ArrowLinkIcon, ArrowRightIcon } from "@/icons";
import { useNodes } from "@/hooks/useUserQueries";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";
import { getConfig } from "@repo/config";
import { ConnectButton } from "../ui/ConnectButton";
import { VotedChip } from "../ui/VotedChip";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

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
    <Flex
      gap={8}
      alignItems={"center"}
      justifyContent={"space-between"}
      width={"100%"}
      flexDirection={{ base: "column", md: "row" }}>
      <VotingFooterAction
        onSubmit={onSubmit}
        votingVariant={votingVariant}
        isLoading={isLoading}
        isVoter={isVoter}
        disabled={disabled}
      />
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
  const { LL } = useI18nContext();
  const { connection } = useWallet();
  const { proposal } = useProposal();
  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });

  if (!connection.isConnected && votingVariant === "voting")
    return <ConnectButton w={{ base: "full", md: "auto" }} text={LL.connect_wallet_to_vote()} />;

  switch (votingVariant) {
    case "voting": {
      if (!isVoter) return;
      return hasVoted ? (
        <VotedChipButton />
      ) : (
        <VotingSubmit onClick={onSubmit} isLoading={isLoading} disabled={disabled} />
      );
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
    <Button
      order={{ base: 2, md: 1 }}
      size={{ base: "md", md: "lg" }}
      w={{ base: "full", md: "auto" }}
      rightIcon={<Icon as={ArrowRightIcon} />}
      onClick={handleClick}
      {...rest}>
      {LL.submit_vote()}
    </Button>
  );
};

const VotedChipButton = () => {
  const { LL } = useI18nContext();
  const { account } = useWallet();
  return (
    <Flex
      alignItems={"center"}
      gap={3}
      order={{ base: 2, md: 1 }}
      flexDirection={{ base: "column", md: "row" }}
      w={{ base: "full", md: "auto" }}>
      <VotedChip w={{ base: "full", md: "auto" }} />
      <Link
        color={"primary.700"}
        fontWeight={500}
        display={"flex"}
        gap={1}
        alignItems={"center"}
        isExternal
        href={`${EXPLORER_URL}/accounts/${account?.address}/txs`}>
        {LL.proposal.see_your_vote()}
        <Icon as={ArrowLinkIcon} width={4} height={4} />
      </Link>
    </Flex>
  );
};

const VotingPower = () => {
  const { LL } = useI18nContext();
  return (
    <Flex
      order={{ base: 1, md: 2 }}
      alignItems={"center"}
      gap={3}
      justifyContent={{ base: "space-between", md: "center" }}
      width={{ base: "100%", md: "auto" }}>
      <Text fontSize={12} fontWeight={600} color={"gray.500"}>
        {LL.your_voting_power()}
      </Text>
      <VotingPowerModal />
    </Flex>
  );
};
