import { useI18nContext } from "@/i18n/i18n-react";
import { InfoBox, infoBoxVariants } from "./ui/InfoBox";
import { useFormatDate } from "@/hooks/useFormatDate";
import { ProposalCardType } from "@/types/proposal";
import { IoArrowForward } from "react-icons/io5";
import { MdOutlineHowToVote } from "react-icons/md";
import { useCallback } from "react";
import { Button, ButtonProps, Flex, Link, Text, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton, useWallet } from "@vechain/vechain-kit";
import { VotingItemVariant } from "./VotingItem";

export const VotingListFooter = ({
  proposal,
  votingNotStarted,
  votingVariant,
}: {
  votingVariant: VotingItemVariant;
  proposal: ProposalCardType;
  votingNotStarted: boolean;
}) => {
  const { LL } = useI18nContext();
  const { formattedProposalDate } = useFormatDate();

  const onSubmit = useCallback(() => {
    //TODO: add submit logic
    console.log("submit");
  }, []);

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
      <VotingFooterAction onSubmit={onSubmit} votingVariant={votingVariant} />
      {/* add error */}
      {!votingNotStarted && <VotingPower votingPower={300} />}
    </Flex>
  );
};

const VotingFooterAction = ({
  onSubmit,
  votingVariant,
}: {
  onSubmit: () => void;
  votingVariant: VotingItemVariant;
}) => {
  const { LL } = useI18nContext();
  const { account } = useWallet();
  if (!account?.address) return <ConnectButton />;

  switch (votingVariant) {
    case "voting":
      return <VotingSubmit onSubmit={onSubmit} />;
    case "result-win":
      return <VotedChip />;
    case "result-lost":
      return <Button>{LL.proposal.see_all_voters()}</Button>;
  }
};

const VotingSubmit = (props: ButtonProps) => {
  const { LL } = useI18nContext();
  return (
    <Button alignSelf={"center"} gap={2} {...props}>
      {LL.submit()} <IoArrowForward />
    </Button>
  );
};

const VotedChip = () => {
  const { LL } = useI18nContext();
  return (
    <Flex alignItems={"center"} gap={3}>
      <Button variant={"ghost"}>{LL.voted()}</Button>
      <Link color={"primary.500"}>{LL.proposal.see_your_vote()}</Link>
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
      <Text
        borderRadius={8}
        paddingX={3}
        paddingY={2}
        display={"flex"}
        gap={3}
        alignItems={"center"}
        borderWidth={1}
        borderColor={"gray.200"}
        bg={"white"}
        color={"gray.600"}
        fontSize={14}
        fontWeight={600}>
        <MdOutlineHowToVote size={20} />
        {votingPower}
      </Text>
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
