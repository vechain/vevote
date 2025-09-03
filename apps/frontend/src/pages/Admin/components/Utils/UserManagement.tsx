import {
  Text,
  VStack,
  HStack,
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
  Box,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useUserRoles } from "@/hooks/useUserRoles";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { FormSkeleton, FormSkeletonProps } from "@/components/ui/FormSkeleton";
import { CheckIcon } from "@/icons";
import { AdminCard } from "../common/AdminCard";
import { userManagementSchema, type UserManagementSchema } from "@/schema/adminSchema";
import { isValidAddress } from "@/utils/zod";

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
  const [currentUserAddress, setCurrentUserAddress] = useState<string>("");

  const { data: userRoles, isLoading: isLoadingRoles, refetch: refetchRoles } = useUserRoles(currentUserAddress);

  const isUserRoles = useMemo(() => Boolean(userRoles && userRoles.length > 0), [userRoles]);

  const handleRoleAction = useCallback(
    async (action: "grant" | "revoke", values: UserManagementSchema) => {
      try {
        await sendTransaction({
          action,
          role: values.selectedRole,
          account: values.userAddress,
        });

        const actionMessage =
          action === "grant"
            ? LL.admin.common_roles.grant_success_description()
            : LL.admin.common_roles.revoke_success_description();

        setSuccessMessage(actionMessage);
        onSuccessOpen();

        setCurrentUserAddress(values.userAddress);
        await refetchRoles();
      } catch (err) {
        const error = err as { error?: { message: string }; message: string };
        throw new Error(
          error?.error?.message ||
            error?.message ||
            LL.admin.common_roles.error_description({ error: LL.admin.unknown_error() }),
        );
      }
    },
    [LL.admin, sendTransaction, onSuccessOpen, refetchRoles],
  );

  const handleFormSubmit: FormSkeletonProps<UserManagementSchema>["onSubmit"] = useCallback(
    async (values, { setError }, action) => {
      try {
        const roleAction = action === "revoke" ? "revoke" : "grant";
        await handleRoleAction(roleAction, values);
      } catch (err) {
        const error = err as Error;
        setError("root", { message: error.message });
      }
    },
    [handleRoleAction],
  );

  return (
    <>
      <AdminCard title={LL.admin.user_management.title()}>
        <FormSkeleton<UserManagementSchema>
          schema={userManagementSchema}
          onSubmit={handleFormSubmit}
          defaultValues={{ userAddress: "", selectedRole: "" }}>
          {({ register, errors, watch, isValid }) => {
            const watchedAddress = watch("userAddress");
            const isAddressValid = watchedAddress && isValidAddress(watchedAddress);

            if (isAddressValid && watchedAddress !== currentUserAddress) {
              setCurrentUserAddress(watchedAddress);
            }

            return (
              <VStack spacing={6} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  {LL.admin.user_management.description()}
                </Text>

                {errors.root && (
                  <Alert status="error">
                    <AlertIcon />
                    {errors.root.message}
                  </Alert>
                )}

                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.userAddress}>
                    <FormLabel>{LL.admin.user_management.user_address_label()}</FormLabel>
                    <Input
                      {...register("userAddress")}
                      placeholder={LL.admin.user_management.user_address_placeholder()}
                    />
                    <FormErrorMessage>{errors.userAddress?.message}</FormErrorMessage>
                  </FormControl>

                  {isAddressValid && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        {LL.admin.user_management.current_roles_label()}
                      </Text>
                      {isLoadingRoles ? (
                        <HStack>
                          <Spinner size="sm" />
                          <Text fontSize="sm" color="gray.500">
                            {LL.admin.user_management.checking_roles()}
                          </Text>
                        </HStack>
                      ) : isUserRoles ? (
                        <Wrap>
                          {userRoles?.map(role => (
                            <WrapItem key={role}>
                              <Badge colorScheme="blue" variant="solid">
                                {LL.admin.common_roles[role]()}
                              </Badge>
                            </WrapItem>
                          ))}
                        </Wrap>
                      ) : (
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">
                          {LL.admin.user_management.no_roles_assigned()}
                        </Text>
                      )}
                    </Box>
                  )}

                  <FormControl isInvalid={!!errors.selectedRole}>
                    <FormLabel>{LL.admin.user_management.role_label()}</FormLabel>
                    <Select {...register("selectedRole")} placeholder={LL.admin.user_management.role_placeholder()}>
                      {ROLES.map(role => (
                        <option key={role} value={role}>
                          {LL.admin.common_roles[role]()}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.selectedRole?.message}</FormErrorMessage>
                  </FormControl>

                  <Divider />

                  <HStack spacing={4}>
                    <Button
                      type="submit"
                      colorScheme="green"
                      size="lg"
                      value="grant"
                      isLoading={isTransactionPending}
                      loadingText={LL.admin.common_roles.granting()}
                      isDisabled={!isValid}
                      flex={1}>
                      {LL.admin.common_roles.grant_role()}
                    </Button>

                    <Button
                      type="submit"
                      colorScheme="red"
                      size="lg"
                      value="revoke"
                      isLoading={isTransactionPending}
                      loadingText={LL.admin.common_roles.revoking()}
                      isDisabled={!isValid}
                      flex={1}>
                      {LL.admin.common_roles.revoke_role()}
                    </Button>
                  </HStack>
                </VStack>
              </VStack>
            );
          }}
        </FormSkeleton>
      </AdminCard>

      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={CheckIcon}
        iconColor="primary.500"
        title={
          successMessage.includes("granted")
            ? LL.admin.common_roles.grant_success_title()
            : LL.admin.common_roles.revoke_success_title()
        }>
        <Text textAlign="center" fontSize={14} color="gray.600">
          {successMessage}
        </Text>
      </MessageModal>
    </>
  );
}
