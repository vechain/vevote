import { useI18nContext } from "@/i18n/i18n-react";
import { CheckIcon, CircleXIcon } from "@/icons";
import { Box, HStack, Icon, Spinner, Text, VStack, Heading } from "@chakra-ui/react";
import { useContractRoles } from "@/hooks/useContractRoles";
import { useWallet } from "@vechain/vechain-kit";
import { ContractType } from "@/pages/Admin/constants/contracts";

interface UserRoleCheckerProps {
  contractType?: ContractType;
}

export function UserRoleChecker({ contractType }: UserRoleCheckerProps) {
  const { LL } = useI18nContext();
  const { account } = useWallet();
  const { defaultRoles, roles, isLoading } = useContractRoles(contractType);

  if (!account?.address) {
    return (
      <Box border="1px" borderColor="gray.200" borderRadius="md" p={4}>
        <Heading size="sm" mb={3}>
          Your Permissions
        </Heading>
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          Connect wallet to see your roles
        </Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box border="1px" borderColor="gray.200" borderRadius="md" p={4}>
        <Heading size="sm" mb={3}>
          Your Permissions
        </Heading>
        <HStack>
          <Spinner size="sm" />
          <Text fontSize="sm" color="gray.500">
            Checking your roles...
          </Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box border="1px" borderColor="gray.200" borderRadius="md" p={4} w={"fit-content"} minW={300}>
      <Heading size="sm" mb={3}>
        Your Permissions
      </Heading>
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
    </Box>
  );
}
