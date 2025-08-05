import { Box, BoxProps, defineStyle, Flex, FlexProps, Grid, GridItem, GridProps } from "@chakra-ui/react";
import { useMemo } from "react";

const PageContainer = ({ variant = "constrained", ...props }: FlexProps & { variant?: "full" | "constrained" }) => {
  return (
    <Flex
      flex={1}
      padding={"20px"}
      minWidth={{ base: "100%", lg: "1000px" }}
      maxWidth={variant === "constrained" ? "1024px" : "full"}
      width={"full"}
      marginX={"auto"}
      flexDirection={"column"}
      gap={{ base: "20px", md: "40px" }}
      {...props}></Flex>
  );
};

const Header = ({ children, ...props }: FlexProps) => {
  return (
    <Flex alignItems={{ base: "start", md: "center" }} {...props}>
      {children}
    </Flex>
  );
};

const Content = ({ children, ...props }: BoxProps) => {
  return <Box {...props}>{children}</Box>;
};

const GridContent = ({ children, ...rest }: Omit<GridProps, "templateColumns">) => {
  return (
    <Grid templateColumns="repeat(12, 1fr)" {...rest}>
      {children}
    </Grid>
  );
};

const gridSectionVariants = {
  half: defineStyle({
    colSpan: 6,
  }),
  full: defineStyle({
    colSpan: 12,
  }),
  max: defineStyle({
    colSpan: 7,
  }),
  min: defineStyle({
    colSpan: 5,
  }),
};

type GridSectionVariants = keyof typeof gridSectionVariants;

const GridSection = ({
  children,
  variant = "half",
  ...rest
}: Omit<BoxProps, "colSpan"> & { variant?: GridSectionVariants }) => {
  const style = useMemo(() => gridSectionVariants[variant], [variant]);
  return (
    <GridItem {...style} {...rest}>
      {children}
    </GridItem>
  );
};

PageContainer.Header = Header;
PageContainer.Content = Content;

PageContainer.GridContent = GridContent;
PageContainer.GridSection = GridSection;

export { PageContainer };
