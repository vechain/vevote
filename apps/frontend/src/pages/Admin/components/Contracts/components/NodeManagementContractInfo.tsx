import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Spinner,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useUserNodeInfo } from "../../../hooks";
import { AdminCard } from "../../common/AdminCard";
import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { formatAddress } from "@/utils/address";
import { nodeInfoSchema, type NodeInfoSchema } from "@/schema/adminSchema";

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
      <VStack spacing={4} align="stretch">
        <FormSkeleton<NodeInfoSchema>
          schema={nodeInfoSchema}
          onSubmit={handleFormSubmit}
          defaultValues={{ userAddress: "" }}>
          {({ register, errors, isValid }) => (
            <VStack spacing={3}>
              <FormControl isInvalid={!!errors.userAddress}>
                <FormLabel fontSize="sm">{LL.admin.node_management.user_address_label()}</FormLabel>
                <Input
                  size="sm"
                  placeholder={LL.admin.node_management.user_address_placeholder()}
                  {...register("userAddress")}
                />
                <FormErrorMessage>{errors.userAddress?.message}</FormErrorMessage>
              </FormControl>
              <Button
                type="submit"
                size="sm"
                width="full"
                isLoading={isLoading}
                isDisabled={!isValid}
                loadingText={LL.admin.node_management.loading_button()}>
                {LL.admin.node_management.load_button()}
              </Button>
            </VStack>
          )}
        </FormSkeleton>

        {error && (
          <Alert status="error" size="sm">
            <AlertIcon />
            <Text fontSize="xs">
              {LL.admin.node_management.error({
                error: error instanceof Error ? error.message : LL.admin.unknown_error(),
              })}
            </Text>
          </Alert>
        )}

        {isLoading && searchAddress && (
          <HStack justify="center" py={4}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.500">
              {LL.admin.node_management.loading_text()}
            </Text>
          </HStack>
        )}

        {userNodeInfo && (
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb={1}>
              {LL.admin.node_management.results_for({
                address: formatAddress(searchAddress),
              })}
            </Text>
            {nodeData.map(({ label, value }) => (
              <HStack key={label} justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="medium">
                  {label}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="right" maxW="150px" wordBreak="break-word">
                  {value}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </AdminCard>
  );
}
