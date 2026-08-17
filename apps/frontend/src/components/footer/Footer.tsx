import { useCookieConsent } from "@/contexts/CookieConsentProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { LegalLinks, ResourcesLinks, VeVoteLinks } from "@/types/terms";
import { Box, Button, Flex, Image, Link, Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { VoteLogo } from "../ui/VoteLogo";

export const Footer = () => {
  const { LL } = useI18nContext();

  return (
    <Box as="footer" position="relative">
      {/* Decorative only: an empty alt keeps it out of the accessibility tree. */}
      <Image src="/images/footer-image.png" alt="" role="presentation" />
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
        <ConsentFooterActions />
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

/**
 * Persistent access to the consent choice. The "Do Not Sell or Share" entry is
 * the CCPA/CPRA opt-out link and must stay reachable from every page.
 */
const ConsentFooterActions = () => {
  const { LL } = useI18nContext();
  const { openPreferences, optOutOfSale } = useCookieConsent();

  return (
    <>
      <FooterButton onClick={openPreferences}>{LL.footer.legal.cookie_preferences()}</FooterButton>
      <FooterButton onClick={optOutOfSale}>{LL.footer.legal.do_not_sell()}</FooterButton>
    </>
  );
};

const FooterButton = ({ onClick, children }: PropsWithChildren<{ onClick: () => void }>) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      height="auto"
      minWidth={0}
      paddingX={0}
      paddingY={0}
      fontSize="16px"
      fontWeight={400}
      textAlign="left"
      whiteSpace="normal"
      justifyContent="flex-start"
      color="stargate.gray"
      _hover={{ color: "stargate.white", bg: "transparent" }}
      _active={{ bg: "transparent" }}>
      {children}
    </Button>
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
