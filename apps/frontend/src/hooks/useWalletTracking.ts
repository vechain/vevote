import { useEffect, useRef } from "react";
import { useWallet } from "@vechain/vechain-kit";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { useLocalStorage } from "./useLocalStorage";
import { areAddressesEqual } from "@/utils/address";

export const useWalletTracking = () => {
  const { connection, account } = useWallet();
  const previousAddress = useRef(account?.address || "no_address");
  const previousConnection = useRef(connection.isConnected || false);

  const [lastTrackedAddress, setLastTrackedAddress] = useLocalStorage<string | null>(
    "vevote_last_tracked_wallet",
    null,
  );

  const hasProcessedConnection = useRef(false);

  useEffect(() => {
    if (!connection) return;

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
      previousAddress.current = currentAddress;
      previousConnection.current = true;
    }

    if (!connection.isConnected && previousConnection.current) {
      trackEvent(MixPanelEvent.USER_DISCONNECTED, {
        address: previousAddress.current,
      });

      previousAddress.current = "no_address";
      previousConnection.current = false;
      hasProcessedConnection.current = false;
      setLastTrackedAddress(null);
    }
  }, [connection, account, lastTrackedAddress, setLastTrackedAddress]);

  return {
    isConnected: connection?.isConnected || false,
    walletType: connection?.source.displayName || "unknown",
  };
};
