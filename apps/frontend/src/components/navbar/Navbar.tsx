import { UserContext } from "@/contexts/UserProvider";
import { useShowNavbar } from "@/hooks/useShowNavbar";
import { Box, BoxProps, Flex, FlexProps, Image, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton } from "@vechain/vechain-kit";
import { PropsWithChildren, useContext, useMemo } from "react";

const NavbarContainer = ({ children, ...restProps }: BoxProps) => {
  return (
    <Box
      transition={"all 0.3s"}
      paddingX={20}
      paddingY={1}
      position={"fixed"}
      top={0}
      left={0}
      right={0}
      zIndex={100}
      {...restProps}>
      {children}
    </Box>
  );
};

const NavbarInnerContainer = ({ children, ...restProps }: FlexProps) => {
  return (
    <Flex
      transition={"all 0.3s"}
      borderRadius={3}
      maxWidth={"1440px"}
      marginX={"auto"}
      justifyContent={"space-between"}
      alignItems={"center"}
      gap={6}
      {...restProps}>
      {children}
      <DAppKitWalletButton
        style={{ whiteSpace: "nowrap" }}
        mobile={useBreakpointValue({
          base: true,
          md: false,
        })}
      />
    </Flex>
  );
};

export const Navbar = () => {
  const { showBackground } = useShowNavbar();

  return (
    <NavbarContainer>
      <NavbarInnerContainer
        backdropBlur={!showBackground ? "md" : "none"}
        bgColor={!showBackground ? "rgba(38, 20, 112, 0.65)" : "transparent"}
        paddingX={6}
        paddingY={4}>
        <Image src="/images/vevote_logo.png" alt="VeVote Logo" width={40} height={8} objectFit={"cover"} />
      </NavbarInnerContainer>
    </NavbarContainer>
  );
};

//todo: get from provider

export const ProposalNavbar = ({ children }: PropsWithChildren) => {
  const { showBackground } = useShowNavbar();

  const { isAdmin } = useContext(UserContext);

  const bgVariant = useMemo(() => {
    if (!showBackground) {
      return isAdmin
        ? "rgba(38, 20, 112, 0.75)"
        : "linear-gradient(102deg, rgba(38, 20, 112, 0.75) 0%, rgba(38, 20, 112, 0.75) 100%)";
    } else {
      return isAdmin ? "primary.800" : "linear-gradient(102deg, #351C9B 0%, #4324C6 100%)";
    }
  }, [showBackground, isAdmin]);
  return (
    <NavbarContainer
      bg={bgVariant}
      paddingX={showBackground ? 20 : 6}
      paddingY={showBackground ? 10 : 6}
      backdropBlur={!showBackground ? "md" : "none"}>
      <NavbarInnerContainer>{children}</NavbarInnerContainer>
    </NavbarContainer>
  );
};
