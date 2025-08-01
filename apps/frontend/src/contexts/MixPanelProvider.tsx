import { analytics } from "@/utils/mixpanel/mixpanel";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWalletTracking } from "@/hooks/useWalletTracking";

export const MixPanelProvider = ({ children }: PropsWithChildren) => {
  const { account } = useWallet();
  const { walletType } = useWalletTracking();

  const [userId, setUserId] = useLocalStorage("mixpanel_user_id", "");

  const finalUserId = useMemo(() => {
    if (!userId) {
      const newId = uuid();
      setUserId(newId);
      return newId;
    }
    return userId;
  }, [userId, setUserId]);

  useEffect(() => {
    analytics.identify(finalUserId);
  }, [finalUserId]);

  useEffect(() => {
    analytics.setUserProperties({
      address: account?.address || "no_address",
      walletType: walletType || "unknown",
      ...(account?.metadata || {}),
    });
  }, [account?.address, account?.metadata, walletType]);

  return <>{children}</>;
};
