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
import { radioTheme } from "@/theme/radio";
import { checkboxTheme } from "@/theme/checkbox";
import { modalTheme } from "@/theme/modal";
import { tableTheme } from "@/theme/table";
import { tooltipTheme } from "@/theme/tooltip";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
  cssVarPrefix: "",
};

const theme = extendTheme({
  styles: {
    global: () => ({
      ":root": {
        body: {
          fontFamily: fonts.body,
        },
        "input::-webkit-calendar-picker-indicator": {
          background: "transparent",
          color: "transparent",
          cursor: "pointer",
          width: "100%",
          height: "auto",
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          top: "0",
        },
      },
    }),
  },
  config,
  colors,
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
    Radio: radioTheme,
    Checkbox: checkboxTheme,
    Modal: modalTheme,
    Table: tableTheme,
    Tooltip: tooltipTheme,
  },
});

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
