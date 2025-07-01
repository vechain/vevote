import { useEffect, useRef } from "react";
import { useWallet } from "@vechain/vechain-kit";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";

export const useWalletTracking = () => {
  const { connection, account } = useWallet();
  const previousAddress = useRef(account?.address || "no_address");
  const previousConnection = useRef(connection);

  useEffect(() => {
    if (!connection) return;

    if (connection.isConnected && (!previousConnection.current || !previousConnection.current.isConnected)) {
      trackEvent(MixPanelEvent.USER_CONNECTED, {
        address: account?.address || "no_address",
        walletType: connection.source.type || "unknown",
        isInAppBrowser: connection?.isInAppBrowser || false,
      });
      previousAddress.current = account?.address || "no_address";
    }

    if (!connection.isConnected && previousConnection.current && previousConnection.current.isConnected) {
      trackEvent(MixPanelEvent.USER_DISCONNECTED, {
        address: previousAddress.current,
      });
      previousAddress.current = "no_address";
    }

    previousConnection.current = connection;
  }, [connection, account]);

  return {
    isConnected: connection?.isConnected || false,
    walletType: connection?.source.displayName || "unknown",
  };
};
