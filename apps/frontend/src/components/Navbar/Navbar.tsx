import { useShowNavbar } from "@/hooks/useShowNavbar";
import { Box, Flex, Image, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton } from "@vechain/vechain-kit";
import { RefObject } from "react";

export const Navbar = ({ triggerNavbarRef }: { triggerNavbarRef: RefObject<HTMLDivElement> | null }) => {
  const { showBackground, showHeader } = useShowNavbar({ elementRef: triggerNavbarRef });

  return (
    <Box
      transition={"top 0.3s"}
      paddingX={20}
      paddingY={1}
      position={"fixed"}
      top={showHeader ? 0 : -100}
      left={0}
      right={0}
      zIndex={100}>
      <Flex
        transition={"all 0.3s"}
        borderRadius={3}
        backdropBlur={showBackground ? "md" : "none"}
        maxWidth={"1440px"}
        marginX={"auto"}
        bgColor={showBackground ? "rgba(38, 20, 112, 0.65)" : "transparent"}
        justifyContent={"space-between"}
        alignItems={"center"}
        paddingX={6}
        paddingY={4}>
        <Image src="/images/vevote_logo.png" alt="VeVote Logo" width={40} height={8} objectFit={"cover"} />
        <DAppKitWalletButton
          mobile={useBreakpointValue({
            base: true,
            md: false,
          })}
        />
      </Flex>
    </Box>
  );
};
