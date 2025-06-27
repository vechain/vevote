import { useUser } from "@/contexts/UserProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { Flex, Link, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useMemo } from "react";

export const Footer = () => {
  const { LL } = useI18nContext();
  const { connection } = useWallet();
  const { isWhitelisted } = useUser();

  const canCreateProposal = useMemo(
    () => connection.isConnected && isWhitelisted,
    [connection.isConnected, isWhitelisted],
  );

  //TODO: Add the LEGAL links
  return (
    <Flex
      minHeight={"100px"}
      paddingX={10}
      paddingY={4}
      alignItems="center"
      justifyContent={"space-between"}
      bgColor="primary.700"
      color={"white"}
      flexDirection={{ base: "column", md: "row" }}
      marginBottom={{ base: canCreateProposal ? "100px" : 0, md: 0 }}>
      <Text
        whiteSpace={"pre-line"}
        fontFamily={"Rubik"}
        fontSize={{ base: "12px", md: "14px" }}
        textAlign={{ base: "center", md: "left" }}
        fontWeight={500}>
        {LL.footer.all_right()}
      </Text>
      <Flex alignItems={"center"} whiteSpace={"nowrap"} gap={4} fontSize={{ base: "12px", md: "14px" }}>
        <Link>{LL.footer.legal.terms_of_service()}</Link>
        <Link>{LL.footer.legal.privacy_policy()}</Link>
        <Link>{LL.footer.legal.cookies_policy()}</Link>
      </Flex>
    </Flex>
  );
};
