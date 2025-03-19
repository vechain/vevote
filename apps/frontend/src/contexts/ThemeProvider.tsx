import { colors, fonts, fontSizes, rootVariables } from "@/theme";
import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { headingStyle } from "@/theme/heading";

import "@fontsource-variable/rubik";
import "@fontsource-variable/inter";
import { badgeTheme } from "@/theme/badge";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  styles: {
    ":root": rootVariables,
    "html, body": {
      fontFamily: "Inter, sans-serif",
    },
  },
  colors,
  config,
  fonts,
  fontSizes,
  components: {
    Heading: headingStyle,
    Badge: badgeTheme,
  },
});

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
