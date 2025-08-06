import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { CloseIcon } from "@/icons";
import { Button, Flex, Heading, Icon, useBreakpointValue } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { ProposalStatus } from "@/types/proposal";
import { VStack, Stack } from "@chakra-ui/react";
import { ProposalHeader } from "./components/ProposalHeader";
import { DescriptionSection } from "./components/DescriptionSection";
import { VotingAndTimeline } from "./components/VotingAndTimeline/VotingAndTimeline";
import { BuyNodeCta } from "./components/BuyNodeCta";

export const ProposalPreview = () => {
  const { proposalDetails } = useCreateProposal();
  const { account } = useWallet();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const proposal = useMemo(
    () =>
      ({
        ...proposalDetails,
        id: "draft",
        status: ProposalStatus.UPCOMING,
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
        <VStack gap={10} w={"full"} alignItems={"stretch"} p={{ base: 6, md: 20 }}>
          <Stack direction={{ base: "column", md: "row" }} w={"full"} gap={{ base: 10, md: 12 }}>
            <VStack gap={10} align="stretch" flex={2}>
              <ProposalHeader />
              <Heading fontWeight={500} color={"gray.800"} lineHeight={"1.33"}>
                {proposal.title}
              </Heading>
              {!isMobile && <DescriptionSection />}
            </VStack>
            <VStack gap={10} align="stretch" flex={1}>
              <VotingAndTimeline />
              {isMobile && <DescriptionSection />}
            </VStack>
          </Stack>
          <BuyNodeCta />
        </VStack>
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
        flex={1}
        rounded={"2xl"}
        alignItems={"center"}
        justifyContent={"center"}
        flexDir={"column"}
        background={"white"}
        height={"fit-content"}
        flexDirection={"column"}
        marginX={{ base: 4, md: 20 }}
        marginTop={{ base: "100px", md: "140px" }}
        marginBottom={{ base: 4, md: 10 }}
        position={"relative"}
        overflow={"hidden"}>
        {children}
      </Flex>
    </Flex>
  );
};
