import { ThemeConfig, extendTheme } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  styles: {
    global: (props: any) => ({
      "html, body": {
        fontFamily: "Inter, sans-serif",
        letterSpacing: "-0.01rem",
        lineHeight: 1.7,
      },
    }),
  },
  config,
});

export default theme;
