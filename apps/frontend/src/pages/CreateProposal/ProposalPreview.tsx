import { PageContainer } from "@/components/PageContainer";
import { BuyANode } from "@/components/proposal/BuyANode";
import { ProposalDetailsCards } from "@/components/proposal/ProposalDetailsCards";
import { ProposalInfoBox } from "@/components/proposal/ProposalInfoBox";
import { ProposalInfos } from "@/components/proposal/ProposalInfos";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { VotingSection } from "@/components/proposal/VotingSection";
import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowRightIcon, CloseIcon } from "@/icons";
import { Box, Button, Flex, Heading, Icon, Image, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";
import { BackButton } from "@/components/ui/BackButton";

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
      }) as const,
    [proposalDetails, account?.address],
  );

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  return (
    <PreviewWrapper>
      <ProposalProvider proposal={proposal}>
        <Box
          width={"full"}
          bgColor={"primary.700"}
          paddingX={{ base: 4, md: 6 }}
          paddingY={{ base: 3, md: 4 }}
          borderRadius={3}
          maxWidth={"1440px"}
          marginX={"auto"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={{ base: 3, md: 6 }}>
          <Flex alignItems={"center"} gap={{ base: 3, md: 6 }} width={"full"} flexWrap={{ base: "wrap", md: "nowrap" }}>
            <BackButton pointerEvents={"none"} />
            <Text
              display={{ base: "none", md: "flex" }}
              fontSize={"14px"}
              color={"primary.200"}
              alignItems={"center"}
              gap={1}
              whiteSpace={"nowrap"}
              overflow={"hidden"}
              textOverflow={"ellipsis"}>
              {LL.homepage()} <Icon as={ArrowRightIcon} width={5} height={4} /> {LL.proposal.title()}
            </Text>
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

const PreviewWrapper = ({ children }: PropsWithChildren) => {
  const { LL } = useI18nContext();
  const { setOpenPreview } = useCreateProposal();
  return (
    <Flex
      position={"relative"}
      top={0}
      left={0}
      zIndex={999}
      background={"gray.100"}
      backdropBlur={"50px"}
      overflow={"hidden"}>
      <Flex
        zIndex={999}
        justifyContent={"space-between"}
        background={"white"}
        paddingY={{ base: 4, md: 6 }}
        paddingX={{ base: 4, md: 20 }}
        position={"fixed"}
        top={0}
        left={0}
        right={0}
        boxShadow={"0px 0px 32px 2px rgba(0, 0, 0, 0.12)"}
        alignItems={"center"}
        gap={{ base: 2, md: 0 }}>
        <Heading
          color={"primary.700"}
          fontWeight={600}
          fontSize={{ base: "lg", md: "xl" }}
          whiteSpace={"nowrap"}
          overflow={"hidden"}
          textOverflow={"ellipsis"}>
          {LL.proposal.create.previewing()}
        </Heading>
        <Button
          variant={"secondary"}
          onClick={() => setOpenPreview(false)}
          rightIcon={<Icon as={CloseIcon} />}
          size={{ base: "md", md: "lg" }}
          fontSize={{ base: "md", md: "lg" }}>
          {LL.close()}
        </Button>
      </Flex>
      <Flex
        alignItems={"center"}
        justifyContent={"center"}
        flexDir={"column"}
        background={"white"}
        height={"fit-content"}
        marginX={"auto"}
        flexDirection={"column"}
        marginTop={{ base: "100px", md: "140px" }}
        position={"relative"}
        overflow={"hidden"}>
        {children}
      </Flex>
    </Flex>
  );
};
