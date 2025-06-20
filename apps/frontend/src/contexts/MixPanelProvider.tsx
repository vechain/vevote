import { useLocalStorage } from "@/hooks/useLocalStorage";
import { analytics, mixpanelInit } from "@/utils/mixpanel/mixpanel";
import { useWallet } from "@vechain/vechain-kit";
import { createContext, PropsWithChildren, useEffect } from "react";
import { v4 as uuid } from "uuid";

export const MixPanelContext = createContext({});

mixpanelInit();

export const MixPanelProvider = ({ children }: PropsWithChildren) => {
  const [userIdentity, setUserIdentity] = useLocalStorage<string | null>("mixpanel_user_identity", null);
  const { account } = useWallet();

  useEffect(() => {
    if (!userIdentity) {
      const newUserId = uuid();
      setUserIdentity(newUserId);
      analytics.identify(newUserId);
    }

    if (account?.address) {
      analytics.setUserProperties({
        address: account.address,
        ...(account.metadata || {}),
      });
    }
  }, [account?.address, account?.metadata, setUserIdentity, userIdentity]);
  return <MixPanelContext.Provider value={{}}>{children}</MixPanelContext.Provider>;
};
