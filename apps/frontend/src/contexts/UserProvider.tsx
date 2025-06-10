import { executeCall } from "@/utils/contract";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useWallet } from "@vechain/vechain-kit";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

enum ROLES {
  ADMIN,
  UPGRADER_ROLE,
  WHITELISTED_ROLE,
  EXECUTOR_ROLE,
  SETTINGS_MANAGER_ROLE,
  NODE_WEIGHT_MANAGER_ROLE,
}

type UserContextProps = {
  hasRole: (checkedRole: ROLES) => Promise<boolean>;
  isAdmin: boolean;
  isExecutor: boolean;
  isUpgrader: boolean;
  isNodeManager: boolean;
  isSettingsManager: boolean;
  isWhitelisted: boolean;
};

export const UserContext = createContext<UserContextProps>({
  hasRole: async () => false,
  isAdmin: false,
  isExecutor: false,
  isUpgrader: false,
  isNodeManager: false,
  isSettingsManager: false,
  isWhitelisted: false,
});

export const UserProvider = (props: React.PropsWithChildren) => {
  const { account } = useWallet();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isExecutor, setIsExecutor] = useState(false);
  const [isUpgrader, setIsUpgrader] = useState(false);
  const [isNodeManager, setIsNodeManager] = useState(false);
  const [isSettingsManager, setIsSettingsManager] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const hasRole = useCallback(
    async (checkedRole: ROLES) => {
      let role = undefined;
      switch (checkedRole) {
        case ROLES.ADMIN: {
          const adminResponse = await executeCall({
            contractAddress,
            contractInterface,
            method: "DEFAULT_ADMIN_ROLE",
            args: [],
          });
          if (adminResponse.success) role = adminResponse.result.plain as string;
          break;
        }
        case ROLES.UPGRADER_ROLE: {
          const adminResponse = await executeCall({
            contractAddress,
            contractInterface,
            method: "UPGRADER_ROLE",
            args: [],
          });
          if (adminResponse.success) role = adminResponse.result.plain as string;
          break;
        }
        case ROLES.WHITELISTED_ROLE: {
          const adminResponse = await executeCall({
            contractAddress,
            contractInterface,
            method: "WHITELISTED_ROLE",
            args: [],
          });
          if (adminResponse.success) role = adminResponse.result.plain as string;
          break;
        }
        case ROLES.EXECUTOR_ROLE: {
          const adminResponse = await executeCall({
            contractAddress,
            contractInterface,
            method: "EXECUTOR_ROLE",
            args: [],
          });
          if (adminResponse.success) role = adminResponse.result.plain as string;
          break;
        }
        case ROLES.SETTINGS_MANAGER_ROLE: {
          const adminResponse = await executeCall({
            contractAddress,
            contractInterface,
            method: "SETTINGS_MANAGER_ROLE",
            args: [],
          });
          if (adminResponse.success) role = adminResponse.result.plain as string;
          break;
        }
        case ROLES.NODE_WEIGHT_MANAGER_ROLE: {
          const adminResponse = await executeCall({
            contractAddress,
            contractInterface,
            method: "NODE_WEIGHT_MANAGER_ROLE",
            args: [],
          });
          if (adminResponse.success) role = adminResponse.result.plain as string;
          break;
        }
      }
      if (!checkedRole || !account?.address) return false;
      const hasRoleResponse = await executeCall({
        contractAddress,
        contractInterface,
        method: "hasRole",
        args: [role, account.address],
      });
      return hasRoleResponse.result.plain as boolean;
    },
    [account],
  );

  useEffect(() => {
    const getAdmin = async () => {
      const admin = await hasRole(ROLES.ADMIN);
      const upgrader = await hasRole(ROLES.UPGRADER_ROLE);
      const weightManager = await hasRole(ROLES.NODE_WEIGHT_MANAGER_ROLE);
      const settingsManager = await hasRole(ROLES.SETTINGS_MANAGER_ROLE);
      const whitelisted = await hasRole(ROLES.WHITELISTED_ROLE);
      const executor = await hasRole(ROLES.EXECUTOR_ROLE);
      setIsAdmin(admin);
      setIsExecutor(executor);
      setIsNodeManager(weightManager);
      setIsSettingsManager(settingsManager);
      setIsUpgrader(upgrader);
      setIsWhitelisted(whitelisted);
    };

    getAdmin();
  }, [hasRole]);

  const ctxValue = useMemo(() => {
    return { hasRole, isAdmin, isExecutor, isNodeManager, isSettingsManager, isUpgrader, isWhitelisted };
  }, [hasRole, isAdmin, isExecutor, isNodeManager, isSettingsManager, isUpgrader, isWhitelisted]);

  return <UserContext.Provider value={ctxValue}>{props.children}</UserContext.Provider>;
};
