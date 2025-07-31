import { ProposalCardVotesResults } from "@/components/proposal/ProposalCardVotesResults";
import { Avatar } from "@/components/ui/Avatar";
import { IconBadge } from "@/components/ui/IconBadge";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalCardType, ProposalStatus } from "@/types/proposal";
import { formatAddress } from "@/utils/address";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { getPicassoImgSrc } from "@/utils/picasso";
import { Flex, Text } from "@chakra-ui/react";
import { useGetAvatarOfAddress } from "@vechain/vechain-kit";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const ProposalCard = ({ status, title, endDate, startDate, id, proposer, results }: ProposalCardType) => {
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
      <TopBar title={title} proposer={proposer} />
      <BottomBar status={status} endDate={endDate} startDate={startDate} id={id} results={results} />
    </Flex>
  );
};

const TopBar = ({ title, proposer }: { title: string; proposer: string }) => {
  const { LL } = useI18nContext();

  const { data: avatar } = useGetAvatarOfAddress(proposer || "");
  console.log(avatar);

  const imageUrl = useMemo(() => avatar || getPicassoImgSrc(proposer || ""), [avatar, proposer]);

  return (
    <Flex
      width={"100%"}
      flexDirection={"column"}
      gap={6}
      alignItems={"start"}
      paddingBottom={4}
      borderBottomWidth={"1px"}
      borderColor={"gray.100"}>
      <Text color={"gray.600"} fontSize={{ md: "20px" }} fontWeight={600}>
        {title}
      </Text>
      <Flex alignItems={"center"} gap={4}>
        <Flex alignItems={"center"} gap={2} borderRightWidth={"1px"} borderColor={"gray.100"} paddingRight={4}>
          <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.500"}>
            {LL.by()}
          </Text>
          <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.800"}>
            {formatAddress(proposer)}
          </Text>
          <Avatar src={imageUrl} bg="gray.200" borderRadius="full" boxSize={6} />
        </Flex>
        {/* TODO: add lince tu discourse */}
        {/* <CommentIcon /> */}
      </Flex>
    </Flex>
  );
};

const BottomBar = ({
  startDate,
  endDate,
  status,
  id,
  results,
}: Pick<ProposalCardType, "endDate" | "startDate" | "status" | "id" | "results">) => {
  const { LL } = useI18nContext();
  const variant = useMemo(() => {
    switch (status) {
      case "min-not-reached":
        return "rejected";
      default:
        return status;
    }
  }, [status]);

  const showDate = useMemo(() => {
    return status === ProposalStatus.UPCOMING || status === ProposalStatus.VOTING;
  }, [status]);

  const showResults = useMemo(() => {
    return ["voting", "approved", "executed", "rejected"].includes(variant);
  }, [variant]);
  return (
    <Flex
      width={"100%"}
      justifyContent={"space-between"}
      alignItems={{ base: "start", md: "center" }}
      flexDirection={{ base: "column", md: "row" }}
      gap={4}>
      <Flex gap={4} alignItems={"center"} width={"fit-content"}>
        <IconBadge variant={variant} />
        {status === ProposalStatus.DRAFT && (
          <Text color={"gray.500"} fontSize={{ base: "12px", md: "14px" }}>
            {LL.not_published()}
          </Text>
        )}
        {showDate && <DateItem startDate={startDate} endDate={endDate} status={status} />}
      </Flex>
      {showResults && <ProposalCardVotesResults proposalId={id} results={results || []} />}
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
      <Text color={"gray.500"}>{status === ProposalStatus.UPCOMING ? LL.start() : LL.end()}</Text>
      <Text fontWeight={500} color={"gray.600"}>
        {stringDate}
      </Text>
    </Flex>
  );
};
