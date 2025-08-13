import "quill/dist/quill.core.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/rubik";
import "./index.css";

import { getConfig } from "@repo/config";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { WalletConnectOptions } from "@vechain/dapp-kit-react";
import { VeChainKitProvider } from "@vechain/vechain-kit";
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
import { CreateProposalProvider } from "./pages/CreateProposal/CreateProposalProvider.tsx";
import { persister, queryClient } from "./utils/queryClient.ts";
import { UserProvider } from "./contexts/UserProvider.tsx";
import { MixPanelProvider } from "./contexts/MixPanelProvider.tsx";
import { LegalLinks } from "./types/terms.ts";

loadLocale("en");

const config = getConfig(import.meta.env.VITE_APP_ENV);
const PROJECT_ID = config.WCProjectId || "";

const walletConnectOptions: WalletConnectOptions = {
  projectId: PROJECT_ID,
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
          loginMethods={[
            // { method: "vechain", gridColumn: 4 },
            { method: "dappkit", gridColumn: 4 },
          ]}
          dappKit={{
            allowedWallets: ["veworld", "sync2", "wallet-connect"],
            walletConnectOptions: {
              projectId: walletConnectOptions.projectId,
              metadata: walletConnectOptions.metadata,
            },
          }}
          language="en"
          network={{
            type: config.network.type,
          }}
          legalDocuments={{
            privacyPolicy: [{ url: LegalLinks.PRIVACY_POLICY, required: true, version: 1 }],
            termsAndConditions: [{ url: LegalLinks.TERMS_OF_SERVICE, required: true, version: 1 }],
            cookiePolicy: [{ url: LegalLinks.COOKIES_POLICY, required: true, version: 1 }],
          }}>
          <MixPanelProvider>
            <ThemeProvider>
              <UserProvider>
                <CreateProposalProvider>{children}</CreateProposalProvider>
              </UserProvider>
            </ThemeProvider>
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
