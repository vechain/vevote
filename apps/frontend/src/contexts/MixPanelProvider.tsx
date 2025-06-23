import { analytics, mixpanelInit } from "@/utils/mixpanel/mixpanel";
import { useWallet } from "@vechain/vechain-kit";
import { createContext, PropsWithChildren, useEffect } from "react";

export const MixPanelContext = createContext({});

mixpanelInit();

export const MixPanelProvider = ({ children }: PropsWithChildren) => {
  const { account } = useWallet();

  useEffect(() => {
    if (account?.address) {
      analytics.setUserProperties({
        address: account.address,
        ...(account.metadata || {}),
      });
    }
  }, [account?.address, account?.metadata]);
  return <MixPanelContext.Provider value={{}}>{children}</MixPanelContext.Provider>;
};
