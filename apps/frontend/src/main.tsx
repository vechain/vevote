import { getConfig } from "@repo/config";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { WalletConnectOptions } from "@vechain/dapp-kit-react";
import { VeChainKitProvider } from "@vechain/vechain-kit";
import "quill/dist/quill.core.css";
import React, { PropsWithChildren, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { localStorageDetector, navigatorDetector } from "typesafe-i18n/detectors";
import App from "./App.tsx";
import { I18nProvider } from "./contexts/I18nProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import { Locales } from "./i18n/i18n-types";
import { detectLocale } from "./i18n/i18n-util";
import { loadLocaleAsync } from "./i18n/i18n-util.async";
import { loadLocale } from "./i18n/i18n-util.sync";
import "./index.css";
import { CreateProposalProvider } from "./pages/CreateProposal/CreateProposalProvider.tsx";
import { persister, queryClient } from "./utils/queryClient.ts";
import { UserProvider } from "./contexts/UserProvider.tsx";
import { DraftProposalProvider } from "./contexts/DraftProposalProvider.tsx";
import { MixPanelProvider } from "./contexts/MixPanelProvider.tsx";

loadLocale("en");

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

const Providers = ({ children }: PropsWithChildren) => {
  const [locale, setLocale] = useState<Locales>("en");

  useEffect(() => {
    const detectedLocale = detectLocale(localStorageDetector, navigatorDetector);
    loadLocaleAsync(detectedLocale).then(() => {
      setLocale(detectedLocale);
    });
  }, []);

  return (
    <I18nProvider locale={locale}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <VeChainKitProvider
          feeDelegation={{
            delegatorUrl: "https://sponsor-testnet.vechain.energy/by/283",
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
          <MixPanelProvider>
            <UserProvider>
              <ThemeProvider>
                <CreateProposalProvider>
                  <DraftProposalProvider>{children}</DraftProposalProvider>
                </CreateProposalProvider>
              </ThemeProvider>
            </UserProvider>
          </MixPanelProvider>
        </VeChainKitProvider>
      </PersistQueryClientProvider>
    </I18nProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
