import { Box, BoxProps, defineStyle, Flex, FlexProps, Link } from "@chakra-ui/react";
import { ConnectButton } from "../ui/ConnectButton";
import { VotingPowerModal } from "../proposal/VotingPowerModal";
import { useWallet } from "@vechain/vechain-kit";
import { VoteLogo } from "../ui/VoteLogo";

export const NavbarContainer = ({ children, ...restProps }: BoxProps) => {
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

export const NavbarInnerContainer = ({ children, ...restProps }: FlexProps) => {
  const { connection } = useWallet();
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
      <Flex alignItems={"center"} gap={{ base: 3, md: 6 }}>
        {connection.isConnected && <VotingPowerModal />}
        <ConnectButton bg={"primary.700"} />
      </Flex>
    </Flex>
  );
};

export const bgHeaderStyle = defineStyle({
  bgImage: { base: "/images/banner-bg-mobile.webp", md: "/images/banner-bg.webp" },
  bgSize: "cover",
  bgPosition: "top",
  bgRepeat: "no-repeat",
  bgAttachment: "fixed",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
});

export const Navbar = () => {
  return (
    <NavbarContainer {...bgHeaderStyle}>
      <NavbarInnerContainer paddingY={4}>
        <Link href="/" display="flex" alignItems="center">
          <VoteLogo width={{ base: 16, md: 20 }} />
        </Link>
      </NavbarInnerContainer>
    </NavbarContainer>
  );
};
