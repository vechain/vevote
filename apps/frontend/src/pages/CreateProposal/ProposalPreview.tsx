import { useI18nContext } from "@/i18n/i18n-react";
import { useCreateProposal } from "./CreateProposalProvider";
import { DAppKitWalletButton, useWallet } from "@vechain/vechain-kit";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { Box, Button, Flex, Heading, Image, Text, useBreakpointValue } from "@chakra-ui/react";
import { IoArrowBack, IoArrowForward, IoClose } from "react-icons/io5";
import { PageContainer } from "@/components/PageContainer";
import { PropsWithChildren, useMemo } from "react";
import { ProposalInfos } from "@/components/proposal/ProposalInfos";
import { ProposalDetailsCards } from "@/components/proposal/ProposalDetailsCards";
import { ProposalInfoBox } from "@/components/proposal/ProposalInfoBox";
import { VotingSection } from "@/components/proposal/VotingSection";
import { BuyANode } from "@/components/proposal/BuyANode";
import { MdOutlineHowToVote } from "react-icons/md";

export const ProposalPreview = () => {
  const { LL } = useI18nContext();
  const { proposalDetails } = useCreateProposal();
  const { account } = useWallet();

  const proposal = useMemo(
    () =>
      ({
        ...proposalDetails,
        id: "draft",
        status: "upcoming",
        proposer: account?.address ?? "",
        createdAt: new Date(),
      } as const),
    [proposalDetails, account?.address],
  );

  return (
    <PreviewWrapper>
      <ProposalProvider proposal={proposal}>
        <Box
          width={"full"}
          bgColor={"primary.700"}
          paddingX={6}
          paddingY={4}
          borderRadius={3}
          maxWidth={"1440px"}
          marginX={"auto"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={6}>
          <Flex alignItems={"center"} gap={6} width={"full"}>
            <Button gap={2} alignItems={"center"} variant={"secondary"}>
              <IoArrowBack />
              {LL.back()}
            </Button>
            <Text display={"flex"} fontSize={"14px"} color={"primary.200"} alignItems={"center"} gap={1}>
              {LL.homepage()} <IoArrowForward /> {LL.proposal.title()}
            </Text>
            {account?.address && <ProposalNavbarActions />}
            <DAppKitWalletButton
              style={{ whiteSpace: "nowrap" }}
              mobile={useBreakpointValue({
                base: true,
                md: false,
              })}
            />
          </Flex>
        </Box>
        <PageContainer paddingTop={"40px"}>
          <Image
            src={proposal.headerImage?.url}
            borderRadius={16}
            alt="Proposal Header"
            width={"100%"}
            aspectRatio={"5/2"}
            objectFit={"cover"}
          />
          <PageContainer.Header flexDirection={"column"} gap={10} alignItems={"start"}>
            <ProposalInfos />
            <ProposalDetailsCards />
            <ProposalInfoBox />
          </PageContainer.Header>
          <VotingSection />
          <BuyANode />
        </PageContainer>
      </ProposalProvider>
    </PreviewWrapper>
  );
};

const ProposalNavbarActions = () => {
  const { LL } = useI18nContext();
  return (
    <Flex alignItems={"center"} gap={2} marginLeft={"auto"}>
      <Button>
        <MdOutlineHowToVote />
        {LL.vote()}
      </Button>
    </Flex>
  );
};

const PreviewWrapper = ({ children }: PropsWithChildren) => {
  const { LL } = useI18nContext();
  const { setOpenPreview } = useCreateProposal();
  return (
    <Flex
      position={"relative"}
      top={0}
      left={0}
      width={"full"}
      zIndex={999}
      background={"gray.100"}
      backdropBlur={"50px"}>
      <Flex
        zIndex={999}
        justifyContent={"space-between"}
        background={"white"}
        paddingY={6}
        paddingX={20}
        position={"fixed"}
        top={0}
        left={0}
        right={0}
        boxShadow={"0px 0px 32px 2px rgba(0, 0, 0, 0.12)"}>
        <Heading color={"primary.700"} fontWeight={600}>
          {LL.proposal.create.previewing()}
        </Heading>
        <Button variant={"secondary"} onClick={() => setOpenPreview(false)}>
          {LL.close()}
          <IoClose />
        </Button>
      </Flex>
      <Flex
        alignItems={"center"}
        justifyContent={"center"}
        background={"white"}
        width={"fit-content"}
        marginX={"auto"}
        flexDirection={"column"}
        marginTop={140}
        position={"relative"}>
        {children}
      </Flex>
    </Flex>
  );
};
