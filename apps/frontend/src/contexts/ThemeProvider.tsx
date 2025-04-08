import { colors, fonts, fontSizes } from "@/theme";
import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { headingStyle } from "@/theme/heading";
import { tagTheme } from "@/theme/tag";
import { linkTheme } from "@/theme/link";
import { dropdownTheme } from "@/theme/dropdown";
import { tabsTheme } from "@/theme/tabs";
import { inputTheme } from "@/theme/input";
import { iconTheme } from "@/theme/Icon";
import { buttonTheme } from "@/theme/button";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors,
  config,
  fonts,
  fontSizes,
  components: {
    Heading: headingStyle,
    Tag: tagTheme,
    Link: linkTheme,
    Tabs: tabsTheme,
    Input: inputTheme,
    Icon: iconTheme,
    Menu: dropdownTheme,
    Button: buttonTheme,
  },
});

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
