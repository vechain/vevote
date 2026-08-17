import { useCookieConsent } from "@/contexts/CookieConsentProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { LegalLinks } from "@/types/terms";
import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { useEffect, useId, useRef } from "react";

/**
 * Consent banner shown until a decision exists.
 *
 * Two deliberate compliance properties:
 *  - "Accept all" and "Reject all" use the same variant, size and width, so
 *    refusing is exactly as easy as accepting (EDPB dark-pattern guidance).
 *  - Nothing is pre-consented: closing or ignoring the banner grants nothing.
 */
export const CookieBanner = () => {
  const { LL } = useI18nContext();
  const { isBannerOpen, acceptAll, rejectAll, openPreferences } = useCookieConsent();
  const headingId = useId();
  const descriptionId = useId();
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (isBannerOpen) headingRef.current?.focus();
  }, [isBannerOpen]);

  if (!isBannerOpen) return null;

  return (
    <Box
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      // Above the fixed navbar (1000) but below the modal overlay (1300), so
      // "Manage preferences" opens on top of the banner rather than under it.
      zIndex="banner"
      bg="white"
      borderTopWidth="1px"
      borderColor="gray.200"
      boxShadow="0px -8px 24px rgba(0, 0, 0, 0.08)"
      paddingX={{ base: 5, md: 8 }}
      paddingY={{ base: 5, md: 6 }}>
      <Flex
        maxWidth="1024px"
        marginX="auto"
        gap={{ base: 4, md: 8 }}
        flexDirection={{ base: "column", lg: "row" }}
        alignItems={{ base: "stretch", lg: "center" }}>
        <Box flex={1}>
          <Text
            ref={headingRef}
            tabIndex={-1}
            id={headingId}
            fontFamily="heading"
            fontWeight={600}
            fontSize={{ base: 16, md: 18 }}
            color="primary.900"
            _focusVisible={{ outline: "2px solid", outlineColor: "blue.300", outlineOffset: "2px" }}>
            {LL.consent.banner.title()}
          </Text>
          <Text id={descriptionId} marginTop={2} fontSize={14} color="gray.600">
            {LL.consent.banner.description()}{" "}
            <Link href={LegalLinks.COOKIES_POLICY} isExternal textDecoration="underline" color="primary.500">
              {LL.consent.banner.cookie_policy_link()}
            </Link>{" "}
            <Link href={LegalLinks.PRIVACY_POLICY} isExternal textDecoration="underline" color="primary.500">
              {LL.consent.banner.privacy_policy_link()}
            </Link>
          </Text>
        </Box>

        <Flex
          flexDirection={{ base: "column", sm: "row" }}
          gap={3}
          alignItems={{ base: "stretch", sm: "center" }}
          flexShrink={0}>
          {/* Accept and Reject are intentionally identical in weight and size. */}
          <Button variant="primary" size="md" width={{ base: "full", sm: "140px" }} onClick={rejectAll}>
            {LL.consent.actions.reject_all()}
          </Button>
          <Button variant="primary" size="md" width={{ base: "full", sm: "140px" }} onClick={acceptAll}>
            {LL.consent.actions.accept_all()}
          </Button>
          <Button variant="ghost" size="md" width={{ base: "full", sm: "auto" }} onClick={openPreferences}>
            {LL.consent.actions.manage()}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
