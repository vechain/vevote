import { Text, useDisclosure } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useVeVoteInfo } from "../../hooks";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { CheckIcon } from "@/icons";
import { AdminCard } from "../common/AdminCard";
import { GovernanceSettingsForm } from "./GovernanceSettingsForm";
import { LevelMultipliersCard } from "./LevelMultipliersCard";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";

export function GovernanceSettings() {
  const { LL } = useI18nContext();
  const { data: veVoteInfo, isLoading, error } = useVeVoteInfo();

  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();

  if (isLoading) {
    return (
      <AdminCard title={LL.admin.governance_settings.title()}>
        <Text>{LL.admin.vevote_contract.loading()}</Text>
      </AdminCard>
    );
  }

  if (error || !veVoteInfo) {
    return (
      <AdminCard title={LL.admin.governance_settings.title()}>
        <GenericInfoBox variant="error">
          <Text color="red.700">
            {error instanceof Error ? error.message : LL.admin.vevote_contract.no_data()}
          </Text>
        </GenericInfoBox>
      </AdminCard>
    );
  }

  return (
    <>
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
    </>
  );
}
