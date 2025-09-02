import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useDisclosure,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  Wrap,
  WrapItem,
  Spinner,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useUserRoles } from "@/hooks/useUserRoles";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { CheckIcon } from "@/icons";

const ROLES = [
  "DEFAULT_ADMIN_ROLE",
  "EXECUTOR_ROLE",
  "SETTINGS_MANAGER_ROLE",
  "NODE_WEIGHT_MANAGER_ROLE",
  "UPGRADER_ROLE",
  "WHITELISTED_ROLE",
  "WHITELIST_ADMIN_ROLE",
] as const;

export function UserManagement() {
  const { LL } = useI18nContext();
  const { sendTransaction, isTransactionPending } = useRoleManagement();

  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [formValues, setFormValues] = useState({
    userAddress: "",
    selectedRole: "",
  });

  const { data: userRoles, isLoading: isLoadingRoles, refetch: refetchRoles } = useUserRoles(formValues.userAddress);

  const handleRoleAction = useCallback(
    async (action: "grant" | "revoke") => {
      if (!formValues.userAddress.trim()) {
        setErrorMessage(LL.admin.user_management.address_required());
        return;
      }

      if (!formValues.selectedRole) {
        setErrorMessage(LL.admin.user_management.role_required());
        return;
      }

      if (!formValues.userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        setErrorMessage(LL.admin.user_management.invalid_address());
        return;
      }

      try {
        setErrorMessage("");

        await sendTransaction({
          action,
          role: formValues.selectedRole,
          account: formValues.userAddress,
        });

        const actionMessage =
          action === "grant"
            ? LL.admin.user_management.grant_success_description()
            : LL.admin.user_management.revoke_success_description();

        setSuccessMessage(actionMessage);
        onSuccessOpen();

        await refetchRoles();

        setFormValues(prev => ({
          ...prev,
          selectedRole: "",
        }));
      } catch (error: any) {
        setErrorMessage(
          error?.error?.message ||
            error?.message ||
            LL.admin.user_management.error_description({ error: "Unknown error" }),
        );
      }
    },
    [formValues, sendTransaction, onSuccessOpen, refetchRoles, LL.admin.user_management],
  );

  const isFormValid = formValues.userAddress.trim() !== "" && formValues.selectedRole !== "";

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>
            {LL.admin.user_management.title()}
          </Heading>
          <Text fontSize="sm" color="gray.600">
            {LL.admin.user_management.description()}
          </Text>
        </Box>

        {errorMessage && (
          <Alert status="error">
            <AlertIcon />
            {errorMessage}
          </Alert>
        )}

        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>{LL.admin.user_management.user_address_label()}</FormLabel>
            <Input
              placeholder={LL.admin.user_management.user_address_placeholder()}
              value={formValues.userAddress}
              onChange={e => setFormValues(prev => ({ ...prev, userAddress: e.target.value }))}
            />
          </FormControl>

          {/* Show current user roles */}
          {formValues.userAddress && formValues.userAddress.match(/^0x[a-fA-F0-9]{40}$/) && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Current Roles:
              </Text>
              {isLoadingRoles ? (
                <HStack>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.500">
                    Checking roles...
                  </Text>
                </HStack>
              ) : userRoles && userRoles.length > 0 ? (
                <Wrap>
                  {userRoles.map(role => (
                    <WrapItem key={role}>
                      <Badge colorScheme="blue" variant="solid">
                        {LL.admin.user_management.roles[role]()}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              ) : (
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  No roles assigned
                </Text>
              )}
            </Box>
          )}

          <FormControl>
            <FormLabel>{LL.admin.user_management.role_label()}</FormLabel>
            <Select
              placeholder={LL.admin.user_management.role_placeholder()}
              value={formValues.selectedRole}
              onChange={e => setFormValues(prev => ({ ...prev, selectedRole: e.target.value }))}>
              {ROLES.map(role => (
                <option key={role} value={role}>
                  {LL.admin.user_management.roles[role]()}
                </option>
              ))}
            </Select>
          </FormControl>

          <Divider />

          <HStack spacing={4}>
            <Button
              colorScheme="green"
              size="lg"
              onClick={() => handleRoleAction("grant")}
              isLoading={isTransactionPending}
              loadingText={LL.admin.user_management.granting()}
              isDisabled={!isFormValid}
              flex={1}>
              {LL.admin.user_management.grant_role()}
            </Button>

            <Button
              colorScheme="red"
              size="lg"
              onClick={() => handleRoleAction("revoke")}
              isLoading={isTransactionPending}
              loadingText={LL.admin.user_management.revoking()}
              isDisabled={!isFormValid}
              flex={1}>
              {LL.admin.user_management.revoke_role()}
            </Button>
          </HStack>
        </VStack>
      </VStack>

      {/* Success Modal */}
      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={CheckIcon}
        iconColor="primary.500"
        title={
          successMessage.includes("granted")
            ? LL.admin.user_management.grant_success_title()
            : LL.admin.user_management.revoke_success_title()
        }>
        <Text textAlign="center" fontSize={14} color="gray.600">
          {successMessage}
        </Text>
      </MessageModal>
    </Box>
  );
}
