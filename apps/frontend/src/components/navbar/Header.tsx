import { useI18nContext } from "@/i18n/i18n-react";
import { Box, Flex, Heading, Icon, Image, Link, Text } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import { ArrowLinkIcon } from "@/icons";
import { stargateButtonStyle } from "@/theme/stargate";
import { ResourcesLinks, VeVoteLinks } from "@/types/terms";

export const ProposalsHeader = () => {
  return (
    <>
      <Navbar />
      <Banner />
    </>
  );
};

export const Banner = () => {
  const { LL } = useI18nContext();
  return (
    <Box
      paddingY={10}
      bgImage={{
        base: import.meta.env.VITE_BASE_PATH + "images/banner-bg-mobile.webp",
        md: import.meta.env.VITE_BASE_PATH + "images/banner-bg.webp",
      }}
      bgSize={"cover"}
      bgPosition={"top"}
      bgRepeat={"no-repeat"}
      bgAttachment={"fixed"}
      height={{ base: "auto", md: "580px", lg: "680px" }}
      overflow={"hidden"}>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        paddingTop={{ base: 16, md: 10, lg: 0 }}
        maxWidth={{ base: "full", lg: "1024px" }}
        paddingX={"20px"}
        marginX={"auto"}>
        <Flex
          flexDirection={"column"}
          gap={{ base: 10, md: 16 }}
          color={"white"}
          minWidth={{ base: "full", md: "350px", lg: "450px" }}>
          <Flex flexDirection={"column"} gap={{ base: 4, md: 6 }} maxWidth={"500px"}>
            <Heading
              as="h1"
              fontSize={{ base: "24px", md: "36px", lg: "48px" }}
              color={"gray.50"}
              maxWidth={{ base: "200px", md: "full" }}>
              {LL.header.title()}
            </Heading>
            <Text fontSize={{ md: "20px", lg: "24px" }} fontWeight={300}>
              {LL.header.description()}
            </Text>
          </Flex>
          <Flex gap={{ base: 4, md: 6 }} flexDirection={{ base: "column", lg: "row" }} alignItems={"center"}>
            <Link {...stargateButtonStyle} href={VeVoteLinks.VEVOTE_DOCS} isExternal>
              {LL.header.how_to_vote()} <Icon as={ArrowLinkIcon} />
            </Link>
            <Link {...stargateButtonStyle} href={ResourcesLinks.STARGATE_APP} isExternal>
              {LL.header.how_to_get_voting_power()}
              <Icon as={ArrowLinkIcon} />
            </Link>
            <Link {...stargateButtonStyle} href={ResourcesLinks.VOTING_POWER} isExternal>
              {LL.learn_how_voting_power()}
              <Icon as={ArrowLinkIcon} />
            </Link>
          </Flex>
        </Flex>
        <Image
          display={{ base: "none", md: "block" }}
          src={import.meta.env.VITE_BASE_PATH + "images/bemo.webp"}
          alt="bemo"
          width={{ md: "320px", lg: "320px" }}
          height={{ md: "520px", lg: "720px" }}
          objectFit={"cover"}
          flexShrink={1}
          transform={{ md: "translateY(80px)", lg: "translateY(100px)" }}
          fetchPriority="high"
          loading="eager"
        />
      </Flex>
    </Box>
  );
};
