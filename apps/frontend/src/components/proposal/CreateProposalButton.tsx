import { useI18nContext } from "@/i18n/i18n-react";
import { CirclePlusIcon } from "@/icons";
import { Button, Flex, Icon, Link } from "@chakra-ui/react";

export const CreateProposalButton = () => {
  const { LL } = useI18nContext();

  return (
    <>
      <Flex
        display={{ base: "flex", md: "none" }}
        borderTopWidth={"1px"}
        borderColor={"gray.100"}
        bg={"#FFFFFF40"}
        justifyContent={"center"}
        alignItems={"center"}
        position={{ base: "fixed", md: "static" }}
        left={0}
        bottom={0}
        width={"full"}
        zIndex={100}
        paddingX={10}
        paddingY={4}
        minHeight={"100px"}
        backdropFilter="auto"
        backdropBlur={"7.5px"}>
        <Button
          as={Link}
          href="/create-proposal"
          marginLeft={{ base: 0, md: "auto" }}
          size={{ base: "md", md: "lg" }}
          width={{ base: "100%", md: "auto" }}>
          <Icon as={CirclePlusIcon} />
          {LL.proposals.create()}
        </Button>
      </Flex>

      <Button
        as={Link}
        display={{ base: "none", md: "inline-flex" }}
        href="/create-proposal"
        marginLeft={{ base: 0, md: "auto" }}
        size={{ base: "md", md: "lg" }}
        width={{ base: "100%", md: "auto" }}>
        <Icon as={CirclePlusIcon} />
        {LL.proposals.create()}
      </Button>
    </>
  );
};
