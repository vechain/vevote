import { useUser } from "@/contexts/UserProvider";
import { useShowNavbar } from "@/hooks/useShowNavbar";
import { Box, BoxProps, defineStyle, Flex, FlexProps, Image } from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";
import { ConnectButton } from "../ui/ConnectButton";

const NavbarContainer = ({ children, ...restProps }: BoxProps) => {
  return (
    <Box
      transition={"all 0.3s"}
      paddingX={{ base: 6, md: 20 }}
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
      borderRadius={12}
      maxWidth={"1440px"}
      marginX={"auto"}
      justifyContent={"space-between"}
      alignItems={"center"}
      gap={6}
      {...restProps}>
      {children}
      <ConnectButton bg={"primary.700"} />
    </Flex>
  );
};

const bgHeaderStyle = defineStyle({
  bgImage: { base: "/images/banner-bg-mobile.png", md: "/images/banner-bg.png" },
  bgSize: "cover",
  bgPosition: "top",
  bgRepeat: "no-repeat",
  bgAttachment: "fixed",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
});

export const Navbar = () => {
  return (
    <NavbarContainer {...bgHeaderStyle}>
      <NavbarInnerContainer paddingY={{ base: 2, md: 4 }}>
        <Image
          src="/svgs/vote_logo.svg"
          alt="VeVote Logo"
          width={"auto"}
          height={{ base: "24px", md: "60px" }}
          objectFit={"cover"}
          transition={"all 0.3s"}
        />
      </NavbarInnerContainer>
    </NavbarContainer>
  );
};

export const ProposalNavbar = ({ children }: PropsWithChildren) => {
  const { showBackground } = useShowNavbar();

  const { isAdmin } = useUser();

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
      paddingX={{ base: 4, md: showBackground ? 20 : 6 }}
      paddingY={{ base: 6, md: showBackground ? 10 : 6 }}
      backdropBlur={!showBackground ? "md" : "none"}>
      <NavbarInnerContainer>{children}</NavbarInnerContainer>
    </NavbarContainer>
  );
};
