import { useUserNodes, useUserRoles } from "@/hooks/useUserQueries";
import { ExtendedUserNode } from "@/types/user";
import { createContext, useContext, useEffect, useMemo } from "react";

const DEFAULT_ROLES = {
  isAdmin: false,
  isExecutor: false,
  isNodeManager: false,
  isSettingsManager: false,
  isUpgrader: false,
  isWhitelisted: false,
  isVoter: false,
};

type UserContextProps = {
  isAdmin: boolean;
  isExecutor: boolean;
  isNodeManager: boolean;
  isSettingsManager: boolean;
  isUpgrader: boolean;
  isWhitelisted: boolean;
  isVoter: boolean;
  nodes: ExtendedUserNode[] | [];
};

export const UserContext = createContext<UserContextProps>({
  ...DEFAULT_ROLES,
  nodes: [],
});

export const UserProvider = (props: React.PropsWithChildren) => {
  const { roles } = useUserRoles();
  const { nodes } = useUserNodes();

  const ctxValue = useMemo(() => {
    return { ...(roles ?? DEFAULT_ROLES), isVoter: nodes.length > 0, nodes };
  }, [nodes, roles]);

  useEffect(() => console.log("UserProvider context value:", ctxValue), [ctxValue]);

  return <UserContext.Provider value={ctxValue}>{props.children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
