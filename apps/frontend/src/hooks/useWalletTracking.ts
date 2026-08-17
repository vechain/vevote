import { useEffect, useRef } from "react";
import { useWallet } from "@vechain/vechain-kit";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { useLocalStorage } from "./useLocalStorage";
import { areAddressesEqual } from "@/utils/address";
import { useCookieConsent } from "@/contexts/CookieConsentProvider";
import { ConsentCategory } from "@/types/consent";

export const useWalletTracking = () => {
  const { connection, account } = useWallet();
  const { hasConsent } = useCookieConsent();
  const previousConnection = useRef(connection.isConnected || false);

  const analyticsAllowed = hasConsent(ConsentCategory.ANALYTICS);

  const [lastTrackedAddress, setLastTrackedAddress, removeLastTrackedAddress] = useLocalStorage<string | null>(
    "vevote_last_tracked_wallet",
    null,
  );

  const hasProcessedConnection = useRef(false);

  // This key exists purely to de-duplicate analytics events, so it must not
  // survive on the device once analytics consent is absent or withdrawn.
  useEffect(() => {
    if (analyticsAllowed) return;
    removeLastTrackedAddress();
    hasProcessedConnection.current = false;
  }, [analyticsAllowed, removeLastTrackedAddress]);

  useEffect(() => {
    if (!connection || !analyticsAllowed) return;

    const currentAddress = account?.address || "no_address";

    if (connection.isConnected) {
      const shouldTrackConnection =
        !hasProcessedConnection.current && !areAddressesEqual(currentAddress, lastTrackedAddress);

      if (shouldTrackConnection) {
        trackEvent(MixPanelEvent.USER_CONNECTED, {
          address: currentAddress,
          walletType: connection.source.type || "unknown",
          isInAppBrowser: connection?.isInAppBrowser || false,
        });

        setLastTrackedAddress(currentAddress);
      }

      hasProcessedConnection.current = true;
      previousConnection.current = true;
    }

    if (!connection.isConnected && previousConnection.current) {
      trackEvent(MixPanelEvent.USER_DISCONNECTED, {
        address: lastTrackedAddress || "no_address",
      });

      previousConnection.current = false;
      hasProcessedConnection.current = false;
      setLastTrackedAddress(null);
    }
  }, [analyticsAllowed, connection, account, lastTrackedAddress, setLastTrackedAddress]);

  return {
    isConnected: connection?.isConnected || false,
    walletType: connection?.source.displayName || "unknown",
  };
};
