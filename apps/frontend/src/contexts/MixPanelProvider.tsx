import { analytics, disableAnalytics, enableAnalytics } from "@/utils/mixpanel/mixpanel";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWalletTracking } from "@/hooks/useWalletTracking";
import { useCookieConsent } from "./CookieConsentProvider";
import { ConsentCategory } from "@/types/consent";

const ANALYTICS_USER_ID_KEY = "mixpanel_user_id";

export const MixPanelProvider = ({ children }: PropsWithChildren) => {
  const { account } = useWallet();
  const { walletType } = useWalletTracking();
  const { hasConsent } = useCookieConsent();

  const analyticsAllowed = hasConsent(ConsentCategory.ANALYTICS);

  const [userId, setUserId, removeUserId] = useLocalStorage(ANALYTICS_USER_ID_KEY, "");

  // The pseudonymous analytics id is itself device storage, so it is only
  // minted once analytics are consented to — and removed again on withdrawal.
  const finalUserId = useMemo(() => {
    if (!analyticsAllowed) return "";
    if (!userId) {
      const newId = uuid();
      setUserId(newId);
      return newId;
    }
    return userId;
  }, [analyticsAllowed, userId, setUserId]);

  useEffect(() => {
    if (analyticsAllowed) {
      enableAnalytics();
      return;
    }

    disableAnalytics();
    removeUserId();
  }, [analyticsAllowed, removeUserId]);

  useEffect(() => {
    if (!analyticsAllowed || !finalUserId) return;
    analytics.identify(finalUserId);
  }, [analyticsAllowed, finalUserId]);

  useEffect(() => {
    if (!analyticsAllowed) return;
    analytics.setUserProperties({
      address: account?.address || "no_address",
      walletType: walletType || "unknown",
      ...(account?.metadata || {}),
    });
  }, [analyticsAllowed, account?.address, account?.metadata, walletType]);

  return <>{children}</>;
};
