import { Box, Flex, Heading, Image } from "@chakra-ui/react";
import { PropsWithChildren, RefObject, useRef } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { Navbar } from "./Navbar";

export const Header = () => {
  const triggerNavbarRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <Navbar triggerNavbarRef={triggerNavbarRef} />
      <Banner triggerNavbarRef={triggerNavbarRef} />
    </>
  );
};

export const Banner = ({ triggerNavbarRef }: { triggerNavbarRef: RefObject<HTMLDivElement> | null }) => {
  const { LL } = useI18nContext();
  return (
    <Box ref={triggerNavbarRef} padding={20} bg={"primary.700"}>
      <Flex
        alignItems={"center"}
        gap={20}
        paddingTop={10}
        maxWidth={"fit-content"}
        marginX={"auto"}
        overflow={"hidden"}>
        <Image src="/svgs/illust.svg" alt="VeVote Logo" width={80} height={80} objectFit={"cover"} />
        <Flex flexDirection={"column"} color={"white"} gap={10}>
          <Box>
            <TopHeading>{LL.header.official()}</TopHeading>
            <Heading
              bgGradient={"linear-gradient(180deg, #A897EC 0%, #FFF 100%)"}
              bgClip={"text"}
              textFillColor={"transparent"}
              fontSize={"48px"}
              fontWeight={500}>
              {LL.header.blockchain()}
            </Heading>
            <TopHeading>{LL.header.voting_platform()}</TopHeading>
          </Box>
          <Flex gap={12} alignItems={"center"}>
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
    <Heading fontSize={"32px"} fontWeight={400} color={"primary.300"}>
      {children}
    </Heading>
  );
};

const TopHeading = ({ children }: PropsWithChildren) => {
  return (
    <Heading fontSize={"48px"} fontWeight={300}>
      {children}
    </Heading>
  );
};
