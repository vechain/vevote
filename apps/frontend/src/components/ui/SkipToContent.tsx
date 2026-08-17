import { useI18nContext } from "@/i18n/i18n-react";
import { Link } from "@chakra-ui/react";

export const MAIN_CONTENT_ID = "main-content";

/**
 * WCAG 2.4.1 (Bypass Blocks): the fixed navbar and hero banner repeat on every
 * page, so keyboard users need a way past them. Visually hidden until focused.
 */
export const SkipToContent = () => {
  const { LL } = useI18nContext();

  return (
    <Link
      href={`#${MAIN_CONTENT_ID}`}
      position="absolute"
      left="-9999px"
      top={0}
      zIndex={3000}
      bg="white"
      color="primary.600"
      fontWeight={600}
      paddingX={4}
      paddingY={3}
      borderRadius="0 0 12px 0"
      _focus={{ left: 0, outline: "2px solid", outlineColor: "blue.300", outlineOffset: "2px" }}
      _focusVisible={{ left: 0 }}>
      {LL.accessibility.skip_to_content()}
    </Link>
  );
};
