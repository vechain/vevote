import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { Text } from "@chakra-ui/react";

export const SensitiveWarning = () => {
  return (
    <GenericInfoBox mt={2} variant="warning">
      <Text fontSize={14} color={"yellow.700"}>
        {"This operation is sensitive. Please use with caution."}
      </Text>
    </GenericInfoBox>
  );
};
