import { executeMultipleClauses } from "@/utils/contract";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@vechain/vevote-contracts";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useWallet } from "@vechain/vechain-kit";
import { CONTRACT_CONFIGS, ContractType } from "@/pages/Admin/constants/contracts";

const getContractInterface = () => VeVote__factory.createInterface();

export const useContractRoles = (contractType: ContractType = "vevote") => {
  const { account } = useWallet();
  const config = CONTRACT_CONFIGS[contractType];
  const contractAddress = getConfig(import.meta.env.VITE_APP_ENV)[config.addressKey];
  const contractInterface = getContractInterface();

  const checkUserRoles = useCallback(async () => {
    if (!account?.address) return [];

    try {
      const roleHashMethods = config.roles.map(role => ({
        method: role,
        args: [],
      }));

      const roleHashResults = await executeMultipleClauses({
        contractAddress,
        contractInterface,
        methodsWithArgs: roleHashMethods,
      });

      const roleHashes = roleHashResults
        .map((result, index) => ({
          name: config.roles[index],
          hash: result?.success ? result.result.plain : null,
        }))
        .filter(role => role.hash);

      const hasRoleMethods = roleHashes.map(role => ({
        method: "hasRole" as const,
        args: [role.hash, account.address],
      }));

      const hasRoleResults = await executeMultipleClauses({
        contractAddress,
        contractInterface,
        methodsWithArgs: hasRoleMethods,
      });

      const userRoles = roleHashes
        .filter((_, index) => hasRoleResults[index]?.success && hasRoleResults[index].result.plain === true)
        .map(role => role.name);

      return userRoles;
    } catch (error) {
      console.error("Error checking user roles:", error);
      return [];
    }
  }, [account?.address, contractAddress, config.roles, contractInterface]);

  const query = useQuery({
    queryKey: ["contractRoles", contractType, account?.address],
    queryFn: checkUserRoles,
    enabled: Boolean(account?.address),
    staleTime: 30000,
  });

  return {
    defaultRoles: config.roles,
    roles: query.data || [],
    isLoading: query.isLoading,
  };
};
