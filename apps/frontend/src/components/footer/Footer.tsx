import { useUser } from "@/contexts/UserProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { LegalLinks, ResourcesLinks, VeVoteLinks } from "@/types/terms";
import { Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { VoteLogo } from "../ui/VoteLogo";

export const Footer = () => {
  const { LL } = useI18nContext();
  const { connection } = useWallet();
  const { isWhitelisted } = useUser();

  const location = useLocation();

  const canCreateProposal = useMemo(
    () => connection.isConnected && isWhitelisted && location.pathname === "/",
    [connection.isConnected, isWhitelisted, location.pathname],
  );

  return (
    <Flex
      w={"100%"}
      direction={"column"}
      gap={6}
      alignItems={"center"}
      paddingX={{ base: 6, md: 44 }}
      paddingY={{ base: 10, md: 20 }}
      bgColor={"gray.800"}
      marginBottom={{ base: canCreateProposal ? "100px" : 0, md: 0 }}>
      <Flex
        width={"100%"}
        flexDirection={{ base: "column", md: "row" }}
        gap={10}
        justifyContent={"space-between"}
        alignItems={"center"}>
        <Flex direction={"column"} gap={{ base: 2, md: 3 }} alignItems={"center"}>
          <VoteLogo height={{ base: "24px", md: "32px" }} />
          <Text fontSize={"12px"} fontWeight={400} color={"gray.300"} fontFamily={"Rubik"}>
            {LL.footer.version()}
          </Text>
        </Flex>
        <DocLinks />
      </Flex>
      <AllRight />
    </Flex>
  );
};

const AllRight = () => {
  const { LL } = useI18nContext();
  return (
    <Text
      color={"gray.300"}
      fontFamily={"Rubik"}
      fontSize={"12px"}
      fontWeight={400}
      textAlign={"center"}
      transform={"translateY(10px)"}>
      {LL.footer.all_right()}
    </Text>
  );
};

const DocLinks = () => {
  const { LL } = useI18nContext();
  return (
    <Flex gap={{ base: 12, md: 10 }} alignItems={"start"} alignSelf={{ base: "start", md: "center" }}>
      <Flex flexDirection={"column"} alignItems={"start"} gap={4}>
        <FooterLabel>{LL.footer.legal.title()}</FooterLabel>
        <Flex flexDirection={"column"} alignItems={"start"} gap={3}>
          <FooterLink href={LegalLinks.PRIVACY_POLICY}>{LL.footer.legal.privacy_policy()}</FooterLink>
          <FooterLink href={LegalLinks.TERMS_OF_SERVICE}>{LL.footer.legal.terms_of_service()}</FooterLink>
          <FooterLink href={LegalLinks.COOKIES_POLICY}>{LL.footer.legal.cookies_policy()}</FooterLink>
        </Flex>
      </Flex>
      <Flex flexDirection={"column"} alignItems={"start"} gap={4}>
        <FooterLabel>{LL.footer.resources.title()}</FooterLabel>
        <Flex flexDirection={"column"} alignItems={"start"} gap={3}>
          <FooterLink href={VeVoteLinks.VEVOTE_DOCS}>{LL.footer.resources.docs()}</FooterLink>
          <FooterLink href={ResourcesLinks.STARGATE}>{LL.footer.resources.stargate()}</FooterLink>
        </Flex>
      </Flex>
    </Flex>
  );
};

const FooterLabel = ({ children }: PropsWithChildren) => {
  return (
    <Heading
      as="h3"
      fontSize={{ base: "14px", md: "18px" }}
      color={"white"}
      fontWeight={600}
      textTransform={"uppercase"}>
      {children}
    </Heading>
  );
};

const FooterLink = ({ href, children }: PropsWithChildren<{ href: string }>) => {
  return (
    <Link
      href={href}
      isExternal
      fontSize={{ base: "12px", md: "14px" }}
      color={"gray.300"}
      _hover={{ textDecoration: "none" }}>
      {children}
    </Link>
  );
};
