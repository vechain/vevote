import { useI18nContext } from "@/i18n/i18n-react";
import { LegalLinks, ResourcesLinks, VeVoteLinks } from "@/types/terms";
import { Flex, Link, Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { VoteLogo } from "../ui/VoteLogo";

export const Footer = () => {
  const { LL } = useI18nContext();

  return (
    <Flex
      id="footer"
      w={"100%"}
      direction={"column"}
      gap={6}
      alignItems={"center"}
      paddingTop={{ base: 10, md: 12 }}
      paddingBottom={{ base: 16, md: 16 }}
      bgColor={"stargate.black"}
      position={"relative"}
      borderTop={"1px solid #ffffff33"}>
      <Flex
        width={"fit-content"}
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: 8, md: 40 }}
        justifyContent={"center"}
        alignItems={"center"}>
        <Flex direction={"column"} gap={{ base: 2, md: 3 }} alignItems={"center"} shrink={0}>
          <VoteLogo height={{ base: "24px", md: "32px" }} />
          <Text fontSize={"14px"} fontWeight={400} color={"stargate.gray"}>
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

const DocLinks = () => {
  const { LL } = useI18nContext();
  return (
    <Flex gap={{ base: 5, md: 10 }} alignItems={"start"} w={"fit-content"} alignSelf={{ base: "start", md: "center" }}>
      <Flex flexDirection={"column"} alignItems={"start"} gap={3} maxWidth={{ base: "90px", md: "fit-content" }}>
        <FooterLabel>{LL.footer.legal.title()}</FooterLabel>
        <FooterLink href={LegalLinks.PRIVACY_POLICY}>{LL.footer.legal.privacy_policy()}</FooterLink>
        <FooterLink href={LegalLinks.TERMS_OF_SERVICE}>{LL.footer.legal.terms_of_service()}</FooterLink>
        <FooterLink href={LegalLinks.COOKIES_POLICY}>{LL.footer.legal.cookies_policy()}</FooterLink>
      </Flex>
      <Flex flexDirection={"column"} alignItems={"start"} gap={3} maxWidth={{ base: "90px", md: "fit-content" }}>
        <FooterLabel>{LL.footer.resources.support()}</FooterLabel>
        <FooterLink href={VeVoteLinks.VEVOTE_DOCS}>{LL.footer.resources.docs()}</FooterLink>
        <FooterLink href={VeVoteLinks.SUPPORT}>{LL.footer.resources.support()}</FooterLink>
      </Flex>
      <Flex flexDirection={"column"} alignItems={"start"} gap={3} maxWidth={{ base: "90px", md: "fit-content" }}>
        <FooterLabel>{LL.footer.resources.title()}</FooterLabel>
        <FooterLink href={ResourcesLinks.STARGATE}>{LL.footer.resources.stargate()}</FooterLink>
      </Flex>
    </Flex>
  );
};

const FooterLabel = ({ children }: PropsWithChildren) => {
  return (
    <Text color={"stargate.white"} fontWeight={600} textTransform={"uppercase"}>
      {children}
    </Text>
  );
};

const FooterLink = ({ href, children }: PropsWithChildren<{ href: string }>) => {
  return (
    <Link href={href} isExternal color={"stargate.gray"} _hover={{ textDecoration: "none" }} fontSize={"16px"}>
      {children}
    </Link>
  );
};
