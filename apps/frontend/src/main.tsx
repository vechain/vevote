import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { persister, queryClient } from "./utils/queryClient.ts";
import { getConfig } from "@repo/config";
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { WalletConnectOptions } from "@vechain/dapp-kit-react";

const config = getConfig(import.meta.env.VITE_APP_ENV);

const walletConnectOptions: WalletConnectOptions = {
  projectId: "a0b855ceaf109dbc8426479a4c3d38d8",
  metadata: {
    name: "Sample VeChain dApp",
    description: "A sample VeChain dApp",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: [`${window.location.origin}/images/logo/my-dapp.png`],
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ChakraProvider>
        <VeChainKitProvider
          feeDelegation={{
            delegatorUrl: "",
            delegateAllTransactions: true,
          }}
          dappKit={{
            allowedWallets: ["veworld", "wallet-connect", "sync2"],
            walletConnectOptions: {
              projectId: walletConnectOptions.projectId,
              metadata: walletConnectOptions.metadata,
            },
          }}
          language="en"
          network={{
            type: config.network.type,
          }}>
          <App />
        </VeChainKitProvider>
      </ChakraProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
