import { useUserRoles } from "@/hooks/useUserQueries";
import { useVechainDomain, useWallet } from "@vechain/vechain-kit";
import { createContext, useContext, useMemo } from "react";

const DEFAULT_ROLES = {
  isAdmin: false,
  isExecutor: false,
  isNodeManager: false,
  isSettingsManager: false,
  isUpgrader: false,
  isWhitelisted: false,
};

type UserContextProps = {
  isAdmin: boolean;
  isExecutor: boolean;
  isNodeManager: boolean;
  isSettingsManager: boolean;
  isUpgrader: boolean;
  isWhitelisted: boolean;
  displayAddress?: string;
};

export const UserContext = createContext<UserContextProps>({
  ...DEFAULT_ROLES,
});

export const UserProvider = (props: React.PropsWithChildren) => {
  const { roles } = useUserRoles();
  const { account } = useWallet();
  const { data } = useVechainDomain(account?.address ?? "");

  const ctxValue: UserContextProps = useMemo(() => {
    return { ...(roles ?? DEFAULT_ROLES), displayAddress: data?.domain || account?.address };
  }, [account?.address, data?.domain, roles]);

  return <UserContext.Provider value={ctxValue}>{props.children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
