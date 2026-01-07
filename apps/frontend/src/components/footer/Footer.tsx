import { useI18nContext } from "@/i18n/i18n-react";
import { LegalLinks, ResourcesLinks, VeVoteLinks } from "@/types/terms";
import { Box, Flex, Image, Link, Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { VoteLogo } from "../ui/VoteLogo";

export const Footer = () => {
  const { LL } = useI18nContext();

  return (
    <Box position="relative">
      <Image src="/images/footer-image.png" />
      <Flex
        id="footer"
        w={"100%"}
        direction={"column"}
        gap={6}
        alignItems={"center"}
        paddingTop={20}
        paddingBottom={{ base: 28, md: 20 }}
        bgColor={"stargate.black"}
        position={"relative"}>
        <Flex
          width={"full"}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 12, md: 40 }}
          justifyContent={"center"}
          paddingX={8}
          alignItems={{ base: "start", md: "center" }}>
          <Flex direction={"column"} gap={{ base: 2, md: 3 }} alignItems={{ base: "start", md: "center" }} shrink={0}>
            <VoteLogo height={{ base: "24px", md: "32px" }} />
            <Text fontSize={"14px"} fontWeight={400} color={"stargate.gray"}>
              {LL.footer.version()}
            </Text>
          </Flex>
          <DocLinks />
        </Flex>
      </Flex>
    </Box>
  );
};

const DocLinks = () => {
  const { LL } = useI18nContext();
  return (
    <Flex
      gap={{ base: 5, md: 10 }}
      alignItems={"start"}
      w={{ base: "full", md: "auto" }}
      alignSelf={{ base: "start", md: "center" }}
      justifyContent={{ base: "space-between" }}>
      <Flex flexDirection={"column"} alignItems={"start"} gap={3} maxWidth={{ base: "full", md: "fit-content" }}>
        <FooterLabel>{LL.footer.legal.title()}</FooterLabel>
        <FooterLink href={LegalLinks.PRIVACY_POLICY}>{LL.footer.legal.privacy_policy()}</FooterLink>
        <FooterLink href={LegalLinks.TERMS_OF_SERVICE}>{LL.footer.legal.terms_of_service()}</FooterLink>
        <FooterLink href={LegalLinks.COOKIES_POLICY}>{LL.footer.legal.cookies_policy()}</FooterLink>
      </Flex>
      <Flex flexDirection={"column"} alignItems={"start"} gap={3} maxWidth={{ base: "full", md: "fit-content" }}>
        <FooterLabel>{LL.footer.resources.title()}</FooterLabel>
        <FooterLink href={ResourcesLinks.STARGATE}>{LL.footer.resources.stargate()}</FooterLink>
        <FooterLink href={VeVoteLinks.VEVOTE_DOCS}>{LL.footer.resources.docs()}</FooterLink>
        <FooterLink href={VeVoteLinks.SUPPORT}>{LL.footer.resources.support()}</FooterLink>
        <FooterLink href={VeVoteLinks.GOVERNANCE_CHARTER}>{LL.footer.resources.governance_charter()}</FooterLink>
      </Flex>
    </Flex>
  );
};

const FooterLabel = ({ children }: PropsWithChildren) => {
  return (
    <Text color={"stargate.white"} fontWeight={600}>
      {children}
    </Text>
  );
};

const FooterLink = ({ href, children }: PropsWithChildren<{ href: string }>) => {
  return (
    <Link
      href={href}
      isExternal
      color={"stargate.gray"}
      transition={"all"}
      transitionDuration={"0.3s"}
      _hover={{ textDecoration: "none", color: "stargate.white" }}
      fontSize={"16px"}>
      {children}
    </Link>
  );
};

/*
  const AllRight = () => {
    const { LL } = useI18nContext();
    return (
      <Text
        color={"stargate.gray"}
        fontSize={"12px"}
        fontWeight={400}
        textAlign={"center"}
        position={"absolute"}
        bottom={2}
        left={0}
        right={0}>
        {LL.footer.all_right()}
      </Text>
    );
  };
*/
