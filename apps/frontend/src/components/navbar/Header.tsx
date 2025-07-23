import { useI18nContext } from "@/i18n/i18n-react";
import { Box, defineStyle, Flex, Heading, Icon, Image, Link, Text } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import { ArrowLinkIcon } from "@/icons";

const stargateButtonStyle = defineStyle({
  width: { base: "full", lg: "fit-content" },
  bg: "rgba(45, 45, 45, 0.10)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  color: "white",
  paddingX: 4,
  paddingY: 6,
  maxHeight: { base: "40px", md: "48px" },
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.20)",
  borderRadius: "99px",
  _hover: {
    textDecoration: "none",
  },
});

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
      paddingX={{ base: 6, md: 20 }}
      paddingY={10}
      bgImage={{ base: "/images/banner-bg-mobile.png", md: "/images/banner-bg.png" }}
      bgSize={"cover"}
      bgPosition={"center"}
      bgRepeat={"no-repeat"}
      height={{ base: "auto", md: "580px", lg: "680px" }}
      overflow={"hidden"}>
      <Flex
        alignItems={"center"}
        justifyContent={"center"}
        paddingTop={{ base: 10, md: 0 }}
        maxWidth={{ base: "full", lg: "1440px" }}
        marginX={"auto"}>
        <Flex
          flexDirection={"column"}
          gap={{ base: 10, md: 16 }}
          color={"white"}
          minWidth={{ base: "full", md: "350px", lg: "450px" }}>
          <Flex flexDirection={"column"} gap={{ base: 4, md: 6 }}>
            <Heading
              as="h1"
              fontSize={{ base: "24px", md: "36px", lg: "48px" }}
              color={"gray.50"}
              maxWidth={{ base: "200px", md: "full" }}>
              {"VeChainThor Voting Platform"}
            </Heading>
            <Text fontSize={{ md: "20px", lg: "24px" }} fontWeight={300}>
              {"Vote to shape the future of VeChainThor"}
            </Text>
          </Flex>
          <Flex gap={{ base: 4, md: 6 }} flexDirection={{ base: "column", lg: "row" }} alignItems={"center"}>
            <Link {...stargateButtonStyle}>
              {"How to Vote"} <Icon as={ArrowLinkIcon} />
            </Link>
            <Link {...stargateButtonStyle}>
              {"How to get Voting Power"}
              <Icon as={ArrowLinkIcon} />
            </Link>
          </Flex>
        </Flex>
        <Image
          display={{ base: "none", md: "block" }}
          src="/images/bemo.png"
          alt="bemo"
          width={{ md: "320px", lg: "420px" }}
          height={{ md: "520px", lg: "720px" }}
          objectFit={"cover"}
          flexShrink={1}
          transform={{ md: "translateY(80px)", lg: "translateY(100px)" }}
        />
      </Flex>
    </Box>
  );
};
