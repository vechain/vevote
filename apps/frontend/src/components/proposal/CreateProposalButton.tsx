import { useFooterAwareFixed } from "@/hooks/useFooterAwareFixed";
import { useI18nContext } from "@/i18n/i18n-react";
import { CirclePlusIcon } from "@/icons";
import { Routes } from "@/types/routes";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { Button, Flex, Icon } from "@chakra-ui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const CreateProposalButton = () => {
  const { LL } = useI18nContext();
  const navigate = useNavigate();
  const footerAwareStyles = useFooterAwareFixed(100);

  const onCreate = useCallback(() => {
    trackEvent(MixPanelEvent.CTA_CREATE_PROPOSAL_CLICKED, { page: "proposals" });
    navigate(Routes.CREATE_PROPOSAL);
  }, [navigate]);

  return (
    <>
      <Flex
        display={{ base: "flex", md: "none" }}
        borderTopWidth={"1px"}
        borderColor={"gray.100"}
        bg={"#FFFFFF40"}
        justifyContent={"center"}
        alignItems={"center"}
        position={{ base: footerAwareStyles.position, md: "static" }}
        left={{ base: footerAwareStyles.left, md: "auto" }}
        bottom={{ base: footerAwareStyles.bottom, md: "auto" }}
        top={{ base: footerAwareStyles.top, md: "auto" }}
        width={"full"}
        zIndex={100}
        paddingX={10}
        paddingY={4}
        minHeight={"100px"}
        backdropFilter="auto"
        backdropBlur={"7.5px"}>
        <Button
          onClick={onCreate}
          marginLeft={{ base: 0, md: "auto" }}
          size={{ base: "md", md: "lg" }}
          width={{ base: "100%", md: "auto" }}>
          <Icon as={CirclePlusIcon} />
          {LL.proposals.create()}
        </Button>
      </Flex>

      <Button
        display={{ base: "none", md: "inline-flex" }}
        onClick={onCreate}
        marginLeft={{ base: 0, md: "auto" }}
        size={{ base: "md", md: "lg" }}
        width={{ base: "100%", md: "auto" }}>
        <Icon as={CirclePlusIcon} />
        {LL.proposals.create()}
      </Button>
    </>
  );
};
