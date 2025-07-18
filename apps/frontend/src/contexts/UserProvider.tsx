import { StargateWarningModal } from "@/components/proposal/StargateWarningModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAllUserNodes, useUserRoles } from "@/hooks/useUserQueries";
import { useDisclosure } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
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
  const { account } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { roles } = useUserRoles();
  const { allNodes } = useAllUserNodes();

  //TODO: remove storage after demo maybe, check with Victor
  const [hasAccepted, setHasAccepted, removeHasAccepted] = useLocalStorage("stargate-warning-accepted", false);

  const ctxValue = useMemo(() => {
    return { ...(roles ?? DEFAULT_ROLES) };
  }, [roles]);

  useEffect(() => {
    if (allNodes?.some(node => !node.isStargate) && !hasAccepted) {
      onOpen();
    }
  }, [allNodes, hasAccepted, onOpen]);

  useEffect(() => {
    if (!account?.address) removeHasAccepted();
  }, [account, removeHasAccepted]);

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
