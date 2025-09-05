import { FormSkeleton, FormSkeletonProps } from "@/components/ui/FormSkeleton";
import { InputMessage } from "@/components/ui/InputMessage";
import { Label } from "@/components/ui/Label";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useUserAdminRoles } from "@/hooks/useAdminUserRoles";
import { useI18nContext } from "@/i18n/i18n-react";
import { CheckIcon } from "@/icons";
import { userManagementSchema, type UserManagementSchema } from "@/schema/adminSchema";
import { executeCall } from "@/utils/contract";
import { isValidAddress } from "@/utils/zod";
import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  HStack,
  Input,
  Select,
  Spinner,
  Text,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useCallback, useMemo } from "react";
import { AdminCard } from "../common/AdminCard";
import { SensitiveWarning } from "../common/SensitiveWarning";

export const ROLES = [
  "DEFAULT_ADMIN_ROLE",
  "EXECUTOR_ROLE",
  "SETTINGS_MANAGER_ROLE",
  "NODE_WEIGHT_MANAGER_ROLE",
  "UPGRADER_ROLE",
  "WHITELISTED_ROLE",
  "WHITELIST_ADMIN_ROLE",
] as const;

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export function UserManagementCard() {
  const { LL } = useI18nContext();
  const { sendTransaction, isTransactionPending } = useRoleManagement();

  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();

  const defaultValues = useMemo(
    () => ({
      userAddress: "",
      selectedRole: "",
    }),
    [],
  );

  const handleRoleAction = useCallback(
    async (action: "grant" | "revoke", values: UserManagementSchema) => {
      const nodeRes = await executeCall({
        contractAddress,
        contractInterface,
        method: values.selectedRole as (typeof ROLES)[number],
        args: [],
      });

      if (!nodeRes.success) {
        throw new Error(LL.admin.common_roles.error_description({ error: LL.admin.unknown_error() }));
      }

      const role = nodeRes.result.plain as (typeof ROLES)[number];

      await sendTransaction({
        action,
        role,
        account: values.userAddress,
      });

      onSuccessOpen();
    },
    [LL.admin, sendTransaction, onSuccessOpen],
  );

  const handleFormSubmit: FormSkeletonProps<UserManagementSchema>["onSubmit"] = useCallback(
    async (values, _, action) => {
      try {
        const roleAction = action === "revoke" ? "revoke" : "grant";
        await handleRoleAction(roleAction, values);
      } catch (err) {
        const error = err as Error;
        console.error(error);
      }
    },
    [handleRoleAction],
  );

  return (
    <>
      <AdminCard title={LL.admin.user_management.title()}>
        <Text fontSize="sm" color="gray.600" mb={4}>
          {LL.admin.user_management.description()}
        </Text>

        <FormSkeleton<UserManagementSchema>
          schema={userManagementSchema}
          onSubmit={handleFormSubmit}
          defaultValues={defaultValues}>
          {({ register, errors, watch, isValid }) => {
            const watchedAddress = watch("userAddress");

            return (
              <VStack spacing={6} align="stretch">
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.userAddress}>
                    <Label label={LL.admin.user_management.user_address_label()} />
                    <Input
                      {...register("userAddress")}
                      placeholder={LL.admin.user_management.user_address_placeholder()}
                    />
                    <InputMessage error={errors.userAddress?.message} />
                  </FormControl>

                  <UserRolesSection userAddress={watchedAddress} />

                  <FormControl isInvalid={!!errors.selectedRole}>
                    <Label label={LL.admin.user_management.role_label()} />
                    <Select {...register("selectedRole")} placeholder={LL.admin.user_management.role_placeholder()}>
                      {ROLES.map(role => (
                        <option key={role} value={role}>
                          {LL.admin.common_roles[role]()}
                        </option>
                      ))}
                    </Select>
                    <InputMessage error={errors.selectedRole?.message} />
                  </FormControl>

                  <Divider />

                  <HStack spacing={4}>
                    <Button
                      type="submit"
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

        <SensitiveWarning />
      </AdminCard>

      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={CheckIcon}
        iconColor="primary.500"
        title={LL.admin.common_roles.grant_success_title()}>
        <Text textAlign="center" fontSize={14} color="gray.600">
          {LL.admin.common_roles.grant_success_description()}
        </Text>
      </MessageModal>
    </>
  );
}

const UserRolesSection = ({ userAddress }: { userAddress: string }) => {
  const { LL } = useI18nContext();
  const { data: userRoles, isLoading: isLoadingRoles } = useUserAdminRoles(
    userAddress && isValidAddress(userAddress) ? userAddress : "",
  );

  const isUserRoles = useMemo(() => Boolean(userRoles && userRoles.length > 0), [userRoles]);

  if (!userAddress || !isValidAddress(userAddress)) {
    return null;
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={2}>
        {LL.admin.user_management.current_roles_label()}
      </Text>
      <RoleSection isLoadingRoles={isLoadingRoles} isUserRoles={isUserRoles} userRoles={userRoles} />
    </Box>
  );
};

const RoleSection = ({
  isLoadingRoles,
  isUserRoles,
  userRoles,
}: {
  isLoadingRoles: boolean;
  isUserRoles: boolean;
  userRoles?: (typeof ROLES)[number][];
}) => {
  const { LL } = useI18nContext();
  if (isLoadingRoles) {
    return (
      <HStack>
        <Spinner size="sm" />
        <Text fontSize="sm" color="gray.500">
          {LL.admin.user_management.checking_roles()}
        </Text>
      </HStack>
    );
  }

  if (isUserRoles) {
    return (
      <Wrap>
        {userRoles?.map(role => (
          <WrapItem key={role}>
            <Badge colorScheme="blue" variant="solid">
              {LL.admin.common_roles[role]()}
            </Badge>
          </WrapItem>
        ))}
      </Wrap>
    );
  }

  return (
    <Text fontSize="sm" color="gray.500" fontStyle="italic">
      {LL.admin.user_management.no_roles_assigned()}
    </Text>
  );
};
