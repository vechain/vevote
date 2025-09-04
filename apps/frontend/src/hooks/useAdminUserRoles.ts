import { executeMultipleClauses } from "@/utils/contract";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const ROLES = [
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

export const useUserAdminRoles = (userAddress: string) => {
  const checkUserRoles = useCallback(async () => {
    try {
      const roleHashMethods = ROLES.map(role => ({
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
          name: ROLES[index],
          hash: result?.success ? result.result.plain : null,
        }))
        .filter(role => role.hash);

      const hasRoleMethods = roleHashes.map(role => ({
        method: "hasRole" as const,
        args: [role.hash, userAddress],
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
  }, [userAddress]);

  return useQuery({
    queryKey: ["userRoles", userAddress],
    queryFn: checkUserRoles,
    enabled: Boolean(userAddress),
    staleTime: 30000,
  });
};
