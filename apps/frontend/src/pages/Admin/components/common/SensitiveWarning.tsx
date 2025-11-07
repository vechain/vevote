import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { useI18nContext } from "@/i18n/i18n-react";
import { Text } from "@chakra-ui/react";

export const SensitiveWarning = () => {
  const { LL } = useI18nContext();
  return (
    <GenericInfoBox mt={2} variant="warning">
      <Text fontSize={14} color={"yellow.700"}>
        {LL.admin.sensitive_operation_warning()}
      </Text>
    </GenericInfoBox>
  );
};
