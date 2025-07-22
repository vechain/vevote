import { useHasVoted } from "@/hooks/useCastVote";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useNodes } from "@/hooks/useUserQueries";
import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowLinkIcon, ArrowRightIcon, MessageSquareIcon } from "@/icons";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { getVotingVariant } from "@/utils/voting";
import { Button, ButtonProps, Flex, Icon, Link, Text, Textarea } from "@chakra-ui/react";
import { getConfig } from "@repo/config";
import { useWallet } from "@vechain/vechain-kit";
import { Dispatch, MouseEventHandler, SetStateAction, useCallback, useMemo } from "react";
import { ConnectButton } from "../ui/ConnectButton";
import { InfoBox, infoBoxVariants } from "../ui/InfoBox";
import { VotedChip } from "../ui/VotedChip";
import { useProposal } from "./ProposalProvider";
import { VotersModal } from "./VotersModal";
import { VotingItemVariant } from "./VotingItem";
import { VotingPowerModal } from "./VotingPowerModal";

const MAX_COMMENT_SIZE = 80;
const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

type VotingListFooterProps = {
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  comment?: string;
  setComment?: Dispatch<SetStateAction<string | undefined>>;
  commentDisabled?: boolean;
};

export const VotingListFooter = ({
  onSubmit,
  isLoading,
  disabled = false,
  comment,
  setComment,
  commentDisabled = false,
}: VotingListFooterProps) => {
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
    <Flex flexDirection={"column"} gap={4} width={"100%"}>
      {connection.isConnected && <InputComment comment={comment} setComment={setComment} disabled={commentDisabled} />}

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

type InputCommentProps = {
  comment?: string;
  setComment?: Dispatch<SetStateAction<string | undefined>>;
  disabled?: boolean;
};

const InputComment = ({ comment, setComment, disabled }: InputCommentProps) => {
  const { LL } = useI18nContext();

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (comment && comment?.length >= MAX_COMMENT_SIZE) {
        if (e.currentTarget.value.length >= MAX_COMMENT_SIZE) return;
        setComment?.(e.currentTarget.value);
      }
      setComment?.(e.currentTarget.value);
    },
    [comment, setComment],
  );

  return (
    <Flex gap={2} flexDirection={"column"} alignItems={"start"}>
      <Flex gap={2} alignItems={"center"}>
        <Icon as={MessageSquareIcon} boxSize={{ base: 4, md: 5 }} />
        <Text fontSize={{ base: 14, md: 16 }} fontWeight={600}>
          {LL.comment()}
        </Text>
      </Flex>

      <Textarea
        background={disabled ? "gray.100" : ""}
        borderColor={disabled ? "gray.200" : ""}
        color={disabled ? "gray.600" : ""}
        fontSize={{ base: 14, md: 16 }}
        defaultValue={comment}
        onChange={onChange}
        placeholder={LL.comment_placeholder()}
        isDisabled={disabled}
      />
      <Text fontSize={12} color={"gray.600"}>
        {LL.filed_length({ current: comment?.length || 0, max: MAX_COMMENT_SIZE })}
      </Text>
    </Flex>
  );
};
