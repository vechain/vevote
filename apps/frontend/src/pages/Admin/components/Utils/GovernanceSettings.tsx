import { Flex, Text, useDisclosure } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useVeVoteInfo } from "../../hooks";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { CheckIcon } from "@/icons";
import { GovernanceSettingsForm } from "./GovernanceSettingsForm";
import { LevelMultipliersCard } from "./LevelMultipliersCard";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";

export function GovernanceSettings() {
  const { LL } = useI18nContext();
  const { data: veVoteInfo, isLoading, error } = useVeVoteInfo();

  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();

  if (isLoading) return <Text>{LL.admin.vevote_contract.loading()}</Text>;

  if (error || !veVoteInfo) {
    return (
      <GenericInfoBox variant="error">
        <Text color="red.700">{LL.admin.vevote_contract.no_data()}</Text>
      </GenericInfoBox>
    );
  }

  return (
    <Flex gap={4} flexDirection={{ base: "column", lg: "row" }} align="flex-start">
      <GovernanceSettingsForm veVoteInfo={veVoteInfo} onSuccess={onSuccessOpen} />
      <LevelMultipliersCard onSuccess={onSuccessOpen} />
      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={CheckIcon}
        iconColor="primary.500"
        title={LL.admin.governance_settings.success_title()}>
        <Text textAlign="center" fontSize={14} color="gray.600">
          {LL.admin.governance_settings.success_description()}
        </Text>
      </MessageModal>
    </Flex>
  );
}
