import { analytics } from "@/utils/mixpanel/mixpanel";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";

export const MixPanelProvider = ({ children }: PropsWithChildren) => {
  const { account } = useWallet();

  const userId = useMemo(() => {
    const existingId = localStorage.getItem("mixpanel_user_id");
    return existingId || uuid();
  }, []);

  useEffect(() => {
    localStorage.setItem("mixpanel_user_id", userId);
    analytics.identify(userId);
  }, [userId]);

  useEffect(() => {
    analytics.setUserProperties({
      address: account?.address || "no_address",
      ...(account?.metadata || {}),
    });
  }, [account?.address, account?.metadata]);

  return <>{children}</>;
};
