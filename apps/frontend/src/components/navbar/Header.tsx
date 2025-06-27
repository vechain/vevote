import { useI18nContext } from "@/i18n/i18n-react";
import { Box, Flex, Heading, Image } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { Navbar } from "./Navbar";

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
      paddingY={{ base: 16, md: 20 }}
      bg={"linear-gradient(102deg, #351C9B 0%, #4324C6 50%, #6042DD 100%)"}>
      <Flex
        alignItems={"center"}
        gap={20}
        paddingTop={10}
        maxWidth={{ base: "full", md: "fit-content" }}
        marginX={"auto"}
        overflow={"hidden"}>
        <Image
          src="/svgs/illust.svg"
          alt="VeVote Logo"
          width={"416px"}
          height={"416px"}
          objectFit={"cover"}
          display={{ base: "none", xl: "block" }}
        />
        <Flex flexDirection={"column"} color={"white"} gap={10}>
          <Box>
            <TopHeading>{LL.header.official()}</TopHeading>
            <Heading
              bgGradient={"linear-gradient(180deg, #A897EC 0%, #FFF 100%)"}
              bgClip={"text"}
              textFillColor={"transparent"}
              fontSize={{ base: "24px", md: "48px" }}
              fontWeight={500}>
              {LL.header.blockchain()}
            </Heading>
            <TopHeading>{LL.header.voting_platform()}</TopHeading>
          </Box>
          <Flex gap={{ base: 2, md: 12 }} alignItems={"center"} width={"full"}>
            <BottomHeading>{LL.header.immutable()}</BottomHeading>
            <BottomHeading>{LL.header.transparent()}</BottomHeading>
            <BottomHeading>{LL.header.decentralized()}</BottomHeading>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

const BottomHeading = ({ children }: PropsWithChildren) => {
  return (
    <Heading fontSize={{ base: "16px", md: "20px", lg: "32px" }} fontWeight={400} color={"primary.300"}>
      {children}
    </Heading>
  );
};

const TopHeading = ({ children }: PropsWithChildren) => {
  return (
    <Heading fontSize={{ base: "24px", md: "36px", lg: "48px" }} fontWeight={300}>
      {children}
    </Heading>
  );
};
