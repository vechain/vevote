import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useUserNodeInfo } from "../../../hooks";
import { AdminCard } from "../../common/AdminCard";
import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { formatAddress } from "@/utils/address";
import { nodeInfoSchema, type NodeInfoSchema } from "@/schema/adminSchema";
import { Label } from "@/components/ui/Label";
import { InputMessage } from "@/components/ui/InputMessage";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";

export function NodeManagementContractInfo() {
  const { LL } = useI18nContext();
  const [searchAddress, setSearchAddress] = useState("");

  const { data: userNodeInfo, isLoading, error } = useUserNodeInfo(searchAddress);

  const handleFormSubmit = async (values: NodeInfoSchema) => {
    setSearchAddress(values.userAddress.trim());
  };

  const nodeData = useMemo(() => {
    if (!userNodeInfo) return [];

    const ownedNodes =
      userNodeInfo.ownedNodes.length > 0 ? ` (${userNodeInfo.ownedNodes.map(id => id.toString()).join(", ")})` : "";
    const managedNodes =
      userNodeInfo.managedNodes.length > 0 ? ` (${userNodeInfo.managedNodes.map(id => id.toString()).join(", ")})` : "";
    return [
      {
        label: LL.admin.node_management.is_node_holder(),
        value: userNodeInfo.isNodeHolder ? LL.admin.node_management.yes() : LL.admin.node_management.no(),
      },
      {
        label: LL.admin.node_management.is_node_delegator(),
        value: userNodeInfo.isNodeDelegator ? LL.admin.node_management.yes() : LL.admin.node_management.no(),
      },
      {
        label: LL.admin.node_management.owned_nodes(),
        value: `${userNodeInfo.ownedNodes.length}${ownedNodes}`,
      },
      {
        label: LL.admin.node_management.managed_nodes(),
        value: `${userNodeInfo.managedNodes.length}${managedNodes}`,
      },
    ];
  }, [userNodeInfo, LL]);

  return (
    <AdminCard title={LL.admin.node_management.card_title()}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="sm" color="gray.600">
          {LL.admin.node_management.help_text()}
        </Text>

        <FormSkeleton<NodeInfoSchema>
          schema={nodeInfoSchema}
          onSubmit={handleFormSubmit}
          defaultValues={{ userAddress: "" }}>
          {({ register, errors, isValid }) => (
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.userAddress}>
                <Label label={LL.admin.node_management.user_address_label()} />
                <Input
                  size="md"
                  placeholder={LL.admin.node_management.user_address_placeholder()}
                  {...register("userAddress")}
                />
                <InputMessage error={errors.userAddress?.message} />
              </FormControl>
              
              <Button
                type="submit"
                size="lg"
                width="full"
                colorScheme="blue"
                isLoading={isLoading}
                isDisabled={!isValid}
                loadingText={LL.admin.node_management.loading_button()}>
                {LL.admin.node_management.load_button()}
              </Button>
            </VStack>
          )}
        </FormSkeleton>

        {searchAddress && (
          <>
            <Divider />
            
            {error && (
              <GenericInfoBox variant="error">
                <Text color="red.700">
                  {LL.admin.node_management.error({
                    error: error instanceof Error ? error.message : LL.admin.unknown_error(),
                  })}
                </Text>
              </GenericInfoBox>
            )}

            {isLoading && (
              <HStack justify="center" py={4}>
                <Spinner size="md" />
                <Text fontSize="sm" color="gray.500">
                  {LL.admin.node_management.loading_text()}
                </Text>
              </HStack>
            )}

            {!error && userNodeInfo && (
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  {LL.admin.node_management.results_for({
                    address: formatAddress(searchAddress),
                  })}
                </Text>
                
                <VStack spacing={3} align="stretch">
                  {nodeData.map(({ label, value }) => (
                    <HStack key={label} justify="space-between" align="center">
                      <Text fontWeight="medium">
                        {label}
                      </Text>
                      <Text color="gray.600" textAlign="right" wordBreak="break-word">
                        {value}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            )}

            {!error && !userNodeInfo && !isLoading && (
              <GenericInfoBox variant="info">
                <Text>{LL.admin.node_management.no_results()}</Text>
              </GenericInfoBox>
            )}
          </>
        )}
      </VStack>
    </AdminCard>
  );
}
