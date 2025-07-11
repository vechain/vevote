import { StargateWarningModal } from "@/components/proposal/StargateWarningModal";
import { useAllUserNodes, useUserRoles } from "@/hooks/useUserQueries";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDisclosure } from "@chakra-ui/react";
import { createContext, useContext, useEffect, useMemo } from "react";

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
};

export const UserContext = createContext<UserContextProps>({
  ...DEFAULT_ROLES,
});

export const UserProvider = (props: React.PropsWithChildren) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { roles } = useUserRoles();
  const { allNodes } = useAllUserNodes();
  const [hasAccepted, setHasAccepted] = useLocalStorage("stargate-warning-accepted", false);

  const ctxValue = useMemo(() => {
    return { ...(roles ?? DEFAULT_ROLES) };
  }, [roles]);

  useEffect(() => {
    if (allNodes?.some(node => !node.isStargate) && !hasAccepted) {
      onOpen();
    }
  }, [allNodes, onOpen, hasAccepted]);

  return (
    <UserContext.Provider value={ctxValue}>
      {props.children}
      <StargateWarningModal isOpen={isOpen} onClose={onClose} setHasAccepted={setHasAccepted} />
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
