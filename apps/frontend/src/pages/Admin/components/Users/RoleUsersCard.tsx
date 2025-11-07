import { VStack, HStack, Text, Select, Button, FormControl, Spinner, Box, Badge, Divider } from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { AdminCard } from "../common/AdminCard";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { CopyLink } from "@/components/ui/CopyLink";
import { getConfig } from "@repo/config";
import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { Label } from "@/components/ui/Label";
import { InputMessage } from "@/components/ui/InputMessage";
import { formatAddress } from "@/utils/address";
import { veVoteService, type RoleUserInfo } from "../../services/VeVoteService";
import { useThor } from "@vechain/vechain-kit";
import { ROLES } from "./UserManagementCard";
import { executeCall } from "@/utils/contract";
import { VeVote__factory } from "@vechain/vevote-contracts";
import { z } from "zod";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

const MAX_VISIBLE_USERS = 6;

const roleUsersQuerySchema = z.object({
  selectedRole: z.enum(ROLES).or(z.literal("")),
});

type RoleUsersQuerySchema = z.infer<typeof roleUsersQuerySchema>;

export function RoleUsersCard() {
  const { LL } = useI18nContext();
  const thor = useThor();
  const [isLoading, setIsLoading] = useState(false);
  const [roleUsers, setRoleUsers] = useState<RoleUserInfo[]>([]);
  const [selectedRole, setSelectedRole] = useState<(typeof ROLES)[number] | "">("");
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      selectedRole: "" as const,
    }),
    [],
  );

  const onSubmit = useCallback(
    async (values: RoleUsersQuerySchema) => {
      if (!thor) {
        setError("Please connect your wallet");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSelectedRole(values.selectedRole);

      try {
        const roleRes = await executeCall({
          contractAddress,
          contractInterface,
          method: values.selectedRole as (typeof ROLES)[number],
          args: [],
        });

        if (!roleRes.success) {
          throw new Error(LL.admin.unknown_error());
        }

        const roleHash = roleRes.result.plain as string;
        const users = await veVoteService.getRoleUsers(thor, roleHash);
        setRoleUsers(users);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        setRoleUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [thor, LL],
  );

  const hasQueried = useMemo(() => Boolean(selectedRole), [selectedRole]);
  const showScrollableList = useMemo(() => roleUsers.length > MAX_VISIBLE_USERS, [roleUsers.length]);

  return (
    <AdminCard title={LL.admin.role_users.title()}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="sm" color="gray.600">
          {LL.admin.role_users.help_text()}
        </Text>

        <FormSkeleton schema={roleUsersQuerySchema} defaultValues={defaultValues} onSubmit={onSubmit}>
          {({ register, errors, watch }) => {
            const isButtonDisabled = watch("selectedRole") === "";
            return (
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.selectedRole}>
                  <Label label={LL.admin.role_users.role_label()} />
                  <Select {...register("selectedRole")} placeholder={LL.admin.role_users.role_placeholder()} size="md">
                    {ROLES.map(role => (
                      <option key={role} value={role}>
                        {LL.admin.common_roles[role]()}
                      </option>
                    ))}
                  </Select>
                  <InputMessage error={errors.selectedRole?.message} />
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  colorScheme="blue"
                  isLoading={isLoading}
                  isDisabled={isButtonDisabled}
                  loadingText={LL.admin.role_users.loading()}>
                  {LL.admin.role_users.query_button()}
                </Button>
              </VStack>
            );
          }}
        </FormSkeleton>

        {hasQueried && (
          <>
            <Divider />

            {error && (
              <GenericInfoBox variant="error">
                <Text color="red.700">{LL.admin.role_users.error_description({ error })}</Text>
              </GenericInfoBox>
            )}

            {isLoading && (
              <HStack justify="center" py={4}>
                <Spinner size="md" />
                <Text fontSize="sm" color="gray.500">
                  {LL.admin.role_users.loading_text()}
                </Text>
              </HStack>
            )}

            {!error && !isLoading && roleUsers.length === 0 && (
              <GenericInfoBox variant="info">
                <Text>{LL.admin.role_users.no_users()}</Text>
              </GenericInfoBox>
            )}

            {!error && !isLoading && roleUsers.length > 0 && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold">
                    {LL.admin.role_users.results_title()}
                  </Text>
                  <Badge colorScheme="blue" variant="solid">
                    {LL.admin.role_users.user_count({ count: roleUsers.length })}
                  </Badge>
                </HStack>

                <Text fontSize="sm" color="gray.600">
                  {LL.admin.role_users.role_selected({
                    role: LL.admin.common_roles[selectedRole as (typeof ROLES)[number]](),
                  })}
                </Text>

                <UserWithRoleList roleUsers={roleUsers} showScrollableList={showScrollableList} />

                {showScrollableList && (
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    {LL.admin.role_users.scrollable_hint()}
                  </Text>
                )}
              </VStack>
            )}
          </>
        )}
      </VStack>
    </AdminCard>
  );
}

const UserWithRoleList = ({
  roleUsers,
  showScrollableList,
}: {
  roleUsers: RoleUserInfo[];
  showScrollableList: boolean;
}) => {
  const { LL } = useI18nContext();
  return (
    <Box
      maxHeight={showScrollableList ? "405px" : "none"}
      overflowY={showScrollableList ? "auto" : "visible"}
      border={showScrollableList ? "1px solid" : "none"}
      borderColor="gray.200"
      borderRadius="md"
      p={showScrollableList ? 3 : 0}>
      <VStack spacing={2} align="stretch">
        {roleUsers.map((user, index) => (
          <HStack
            key={`${user.address}-${index}`}
            justify="space-between"
            align="center"
            p={2}
            bg="gray.50"
            borderRadius="md">
            <VStack align="start" spacing={1}>
              <CopyLink
                href={`${EXPLORER_URL}/accounts/${user.address}`}
                isExternal
                textToCopy={user.address}
                color="primary.700"
                fontWeight={500}>
                {formatAddress(user.address)}
              </CopyLink>
              <Text fontSize="xs" color="gray.500">
                {LL.admin.role_users.granted_at({ date: user.grantedAt.toLocaleDateString() })}
              </Text>
            </VStack>
            <CopyLink
              href={`${EXPLORER_URL}/transactions/${user.transactionId}`}
              isExternal
              textToCopy={user.transactionId}
              color="blue.500"
              fontSize="xs">
              {LL.admin.role_users.view_tx()}
            </CopyLink>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};
