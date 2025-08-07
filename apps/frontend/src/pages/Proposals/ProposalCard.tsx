import { DiscourseLink } from "@/components/proposal/DiscourseLink";
import { ProposalCardVotesResults } from "@/components/proposal/ProposalCardVotesResults";
import { Avatar } from "@/components/ui/Avatar";
import { IconBadge } from "@/components/ui/IconBadge";
import { ColorByVote, IconByVote } from "@/constants";
import { useHasVoted, useIndexerVoteResults, useVoteByProposalId } from "@/hooks/useCastVote";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useVechainDomainOrAddress } from "@/hooks/useVechainDomainOrAddress";
import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalCardType, ProposalStatus } from "@/types/proposal";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { getPicassoImgSrc } from "@/utils/picasso";
import { Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { useGetAvatarOfAddress } from "@vechain/vechain-kit";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const ProposalCard = ({ status, title, endDate, startDate, id, proposer, discourseUrl }: ProposalCardType) => {
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    trackEvent(MixPanelEvent.CTA_PROPOSAL_CARD_CLICKED, {
      proposalId: id,
    });
    navigate(`/proposal/${id}`);
  }, [id, navigate]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  return (
    <Flex
      cursor={"pointer"}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={"button"}
      tabIndex={0}
      width={"100%"}
      padding={6}
      bg={"white"}
      borderRadius={16}
      border={"1px"}
      borderColor={"gray.100"}
      gap={6}
      alignItems={"start"}
      flexDirection={"column"}>
      <TopBar title={title} proposer={proposer} discourseUrl={discourseUrl} id={id} />
      <BottomBar status={status} endDate={endDate} startDate={startDate} id={id} />
    </Flex>
  );
};

const TopBar = ({
  title,
  proposer,
  discourseUrl,
  id,
}: {
  title: string;
  proposer: string;
  discourseUrl?: string;
  id: string;
}) => {
  const { LL } = useI18nContext();

  const { data: avatar } = useGetAvatarOfAddress(proposer || "");
  const { addressOrDomain } = useVechainDomainOrAddress(proposer);

  const imageUrl = useMemo(() => avatar || getPicassoImgSrc(proposer || ""), [avatar, proposer]);

  const { hasVoted } = useHasVoted({ proposalId: id || "" });
  const { vote } = useVoteByProposalId({ proposalId: id || "", enabled: hasVoted });

  const voteIcon = IconByVote[vote];
  const voteColor = ColorByVote[vote];

  return (
    <Flex
      width={"100%"}
      justifyContent={"space-between"}
      flexDirection={"column"}
      gap={3}
      alignItems={"start"}
      paddingBottom={4}
      borderBottomWidth={"1px"}
      borderColor={"gray.100"}>
      <Text color={"gray.600"} fontSize={{ md: "20px" }} fontWeight={600}>
        {title}
      </Text>
      <Stack
        direction={{ base: "column", md: "row" }}
        gap={4}
        width={"full"}
        justifyContent={{ base: "flex-start", md: "space-between" }}>
        <Flex alignItems={"center"} gap={4}>
          <Flex alignItems={"center"} gap={2} borderRightWidth={"1px"} borderColor={"gray.100"} paddingRight={4}>
            <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.600"}>
              {LL.by()}
            </Text>
            <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.800"}>
              {addressOrDomain}
            </Text>
            <Avatar src={imageUrl} bg="gray.200" borderRadius="full" boxSize={6} />
          </Flex>
          {discourseUrl && <DiscourseLink src={discourseUrl} />}
        </Flex>
        {hasVoted && (
          <HStack gap={4}>
            <Text fontSize={"sm"} fontWeight={500} color={"gray.600"}>
              {LL.proposal.you_voted()}
            </Text>
            <HStack
              borderRadius={8}
              border={"2px solid"}
              padding={{ base: "4px 8px", md: "8px 12px" }}
              backgroundColor={"white"}
              borderColor={voteColor}>
              <Icon as={voteIcon} width={4} height={4} />
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight={600} color={voteColor}>
                {vote}
              </Text>
            </HStack>
          </HStack>
        )}
      </Stack>
    </Flex>
  );
};

const BottomBar = ({
  id,
  startDate,
  endDate,
  status,
}: Pick<ProposalCardType, "endDate" | "startDate" | "status" | "id">) => {
  const { LL } = useI18nContext();
  const { results, isLoading: isLoadingResults } = useIndexerVoteResults({ proposalId: id });

  const showDate = useMemo(() => {
    return status === ProposalStatus.UPCOMING || (status === ProposalStatus.VOTING && dayjs(endDate).isAfter(dayjs()));
  }, [endDate, status]);

  const showResults = useMemo(() => {
    return !isLoadingResults && ["voting", "approved", "executed", "rejected"].includes(status);
  }, [status, isLoadingResults]);

  return (
    <Flex
      width={"100%"}
      justifyContent={"space-between"}
      alignItems={"flex-start"}
      flexDirection={"row"}
      gap={4}
      wrap={"wrap"}>
      <Flex gap={4} alignItems={"center"} width={"fit-content"}>
        <IconBadge variant={status} />
        {status === ProposalStatus.DRAFT && (
          <Text color={"gray.500"} fontSize={{ base: "12px", md: "14px" }}>
            {LL.not_published()}
          </Text>
        )}
        {showDate && <DateItem startDate={startDate} endDate={endDate} status={status} />}
      </Flex>
      {showResults && <ProposalCardVotesResults status={status} results={results?.data || []} />}
    </Flex>
  );
};

const DateItem = ({ startDate, endDate, status }: Pick<ProposalCardType, "endDate" | "startDate" | "status">) => {
  const { LL } = useI18nContext();

  const { formattedProposalCardDate } = useFormatDate();

  const stringDate = useMemo(() => {
    switch (status) {
      case ProposalStatus.UPCOMING:
        return formattedProposalCardDate(startDate);
      default:
        return formattedProposalCardDate(endDate);
    }
  }, [status, formattedProposalCardDate, startDate, endDate]);

  return (
    <Flex alignItems={"center"} gap={2} fontSize={{ base: "12px", md: "14px" }}>
      <Text color={"gray.600"}>{status === ProposalStatus.UPCOMING ? LL.start() : LL.end()}</Text>
      <Text fontWeight={500} color={"gray.600"}>
        {stringDate}
      </Text>
    </Flex>
  );
};
