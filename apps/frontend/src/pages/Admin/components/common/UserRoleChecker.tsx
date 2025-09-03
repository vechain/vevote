import { useI18nContext } from "@/i18n/i18n-react";
import { CheckIcon, CircleXIcon } from "@/icons";
import { HStack, Icon, Spinner, Text, VStack } from "@chakra-ui/react";
import { useContractRoles } from "@/hooks/useContractRoles";
import { useWallet } from "@vechain/vechain-kit";
import { ContractType } from "@/pages/Admin/constants/contracts";
import { AdminCard } from "./AdminCard";

interface UserRoleCheckerProps {
  readonly contractType?: ContractType;
}

export function UserRoleChecker({ contractType }: UserRoleCheckerProps) {
  const { LL } = useI18nContext();
  const { account } = useWallet();
  const { defaultRoles, roles, isLoading } = useContractRoles(contractType);

  if (!account?.address) {
    return (
      <AdminCard title={LL.admin.user_role_checker.title()}>
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          {LL.admin.user_role_checker.connect_wallet_message()}
        </Text>
      </AdminCard>
    );
  }

  if (isLoading) {
    return (
      <AdminCard title={LL.admin.user_role_checker.title()}>
        <HStack>
          <Spinner size="sm" />
          <Text fontSize="sm" color="gray.500">
            {LL.admin.user_role_checker.checking_roles()}
          </Text>
        </HStack>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Your Permissions">
      <VStack spacing={2} align="stretch">
        {defaultRoles.map(role => {
          const hasRole = roles?.includes(role) || false;

          return (
            <HStack key={role} justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="medium">
                {LL.admin.common_roles[role]()}
              </Text>
              <Icon as={hasRole ? CheckIcon : CircleXIcon} color={hasRole ? "green.500" : "red.400"} w={4} h={4} />
            </HStack>
          );
        })}
      </VStack>
    </AdminCard>
  );
}
