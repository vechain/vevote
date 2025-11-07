import { getConfig } from "@repo/config";
import { VeVote__factory } from "@vechain/vevote-contracts";
import { EnhancedClause } from "@vechain/vechain-kit";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { useCallback } from "react";
import { ROLES } from "@/pages/Admin/components/Users/UserManagementCard";

type RoleManagementProps = {
  action: "grant" | "revoke";
  role: (typeof ROLES)[number];
  account: string;
};

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useRoleManagement = () => {
  const buildClauses = useCallback((props: RoleManagementProps) => {
    const clauses: EnhancedClause[] = [];

    try {
      const baseClause = {
        to: contractAddress,
        value: 0,
      };

      if (props.action === "grant") {
        const clause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("grantRole", [props.role, props.account]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("grantRole"))),
          comment: `Grant role to ${props.account}`,
        };
        clauses.push(clause as EnhancedClause);
      } else if (props.action === "revoke") {
        const clause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("revokeRole", [props.role, props.account]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("revokeRole"))),
          comment: `Revoke role from ${props.account}`,
        };
        clauses.push(clause as EnhancedClause);
      }

      return clauses;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  return useVevoteSendTransaction({
    clauseBuilder: buildClauses,
  });
};
