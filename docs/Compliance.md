# Privacy & accessibility compliance

Working notes behind the Iubenda findings for VeVote. This file has two jobs:

1. Give whoever maintains the published Privacy and Cookie policies an accurate,
   code-derived inventory of what VeVote actually loads and stores.
2. Record which findings were fixed in this repository, and which ones cannot be.

Keep it in sync with `apps/frontend/src/types/consent.ts` — the categories and
service lists there drive the preference centre the user sees.

## Where the policies live

The Privacy Policy, Terms and Cookie Policy are published outside this
repository, at `https://vevote.vechain.org/{privacy,terms,cookies}` (see
`apps/frontend/src/types/terms.ts`). **Nothing in this repo can change their
text.** The inventory below is what those documents need to cover.

## Service and storage inventory

Derived from `apps/frontend` on the mainnet configuration.

### Strictly necessary — no consent required

| What                   | Where                                  | Storage                                                             | Purpose                                                   |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| Consent record         | `CookieConsentProvider`                | `localStorage` `vevote_cookie_consent`, `vevote_cookie_consent_log` | Stores and evidences the user's own cookie choice         |
| TanStack Query cache   | `src/utils/queryClient.ts`             | `localStorage` `REACT_QUERY_OFFLINE_CACHE`                          | Caches on-chain reads so the UI works offline/on reload   |
| vechain-kit / dapp-kit | `VeChainKitProvider` in `src/main.tsx` | `localStorage`                                                      | Keeps the wallet connection the user explicitly initiated |
| WalletConnect (Reown)  | `@reown/appkit` via vechain-kit        | `localStorage`, relay connection to `walletconnect.com`             | Wallet pairing, only when the user picks WalletConnect    |

### Analytics — consent required, off by default

| What     | Where                 | Storage                                                                   | Data sent                                                                                                             |
| -------- | --------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Mixpanel | `src/utils/mixpanel/` | `localStorage` (`mp_*`), `mixpanel_user_id`, `vevote_last_tracked_wallet` | Page/CTA events, proposal and vote actions, wallet address, wallet type, browser locale, IP (implicitly, to Mixpanel) |

Mixpanel is a US-based processor, so an international-transfer basis belongs in
the Privacy Policy. The connected **wallet address is personal data** in this
context: it is a persistent identifier tied to an identifiable individual, and it
is also written to Mixpanel people profiles.

### Third parties contacted without storing anything on the device

| What                                  | Where                                                                    | Note for the policies                                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Fonts                          | `apps/frontend/index.html` (`fonts.googleapis.com`, `fonts.gstatic.com`) | Sets no cookie, but the browser sends the user's **IP address to Google** on every page load. This is a disclosable processing activity, and several EU decisions treat hot-linked Google Fonts as an unlawful transfer. Self-hosting the two families removes the issue entirely — see "Not done here". |
| VeChain node / indexer / IPFS gateway | `packages/config/*.ts`                                                   | First-party VeChain infrastructure; IP address is processed to serve the request                                                                                                                                                                                                                         |
| Discourse                             | `discourseBaseUrl`                                                       | Outbound links only; no embed                                                                                                                                                                                                                                                                            |

Privy (`@privy-io/react-auth`) ships inside vechain-kit but is **not** reachable
in this configuration: `loginMethods` in `src/main.tsx` is limited to `dappkit`.
Re-check this if social login is ever enabled.

## Iubenda findings — disposition

| #   | Finding                                                   | Verdict                                                        | Where                                                                                                                                                                                                              |
| --- | --------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Privacy Policy misses services processing personal data   | **Real, not fixable here**                                     | Policy is hosted externally. Inventory above is what it must list — Mixpanel and Google Fonts are the notable gaps.                                                                                                |
| 2a  | Cookie Policy misses services installing cookies/trackers | **Real, not fixable here**                                     | Same as above. Note the policy must cover `localStorage`, not just cookies — ePrivacy Art. 5(3) is technology-neutral and VeVote uses no HTTP cookies of its own.                                                  |
| 2b  | No cookie banner                                          | **Real, fixed**                                                | `src/components/consent/CookieBanner.tsx`; Mixpanel is now initialised only after consent.                                                                                                                         |
| 3   | Images missing alternative text                           | **Partly real, fixed**                                         | Only `footer-image.png` was missing `alt`; it is decorative, so it now carries `alt=""`. The larger gap was unlabelled icon-only _buttons_, fixed in the same pass.                                                |
| 4   | European Accessibility Act conformance                    | **Real as a direction, scope needs a legal call**              | Concrete WCAG 2.1 A/AA failures found and fixed are listed below. Whether VeVote is an EAA "service" is a legal determination, not a code one.                                                                     |
| 5   | Accept/Reject buttons of equal prominence                 | **Real, fixed**                                                | Both use `variant="primary"`, `size="md"` and the same fixed width.                                                                                                                                                |
| 6   | Data-collection notice + "Do Not Sell or Share" link      | **Real, fixed mechanically; applicability needs a legal call** | Banner states what is collected; the footer carries a persistent opt-out link, and GPC is honoured automatically. Whether VeChain meets the CCPA/CPRA business thresholds is not something the code can determine. |
| 7   | Consent must be collected, stored and producible          | **Real, partly fixed**                                         | Every decision is stored with id, timestamp, policy version, categories, method and context, and the user can download their own record. **Server-side archival is still missing** — see below.                    |

## Accessibility issues found and fixed

Verified against WCAG 2.1 (the EN 301 549 baseline the EAA references).

| SC                               | Issue                                                                                                                                | Fix                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 1.1.1 Non-text Content (A)       | `footer-image.png` had no `alt`                                                                                                      | `alt=""` + `role="presentation"` (decorative)              |
| 4.1.2 Name, Role, Value (A)      | Icon-only buttons had no accessible name: table pagination prev/next, search clear, number increment/decrement, delete-voting-option | `aria-label` on each; icons marked `aria-hidden`           |
| 3.3.2 / 4.1.2 (A)                | Search field was labelled only by its placeholder                                                                                    | `aria-label` derived from the placeholder, `type="search"` |
| 2.4.1 Bypass Blocks (A)          | Fixed navbar and hero repeat on every route with no way past them                                                                    | Skip link + `<main>` target                                |
| 2.4.2 Page Titled (A)            | `<title>` was the constant "VeVote" on every route                                                                                   | `useDocumentTitle` per route                               |
| 1.3.1 Info and Relationships (A) | No landmarks anywhere — `nav`, `main` and `footer` all rendered as `div`                                                             | `as="nav"` / `as="main"` / `as="footer"`                   |

Checked and found **already correct** — no change needed: proposal cards are
keyboard-operable (`role="button"`, `tabIndex`, Enter/Space handler); Chakra
`IconButton` usages already carry `aria-label`; modals get focus trapping and
labelled close buttons from Chakra; `<html lang>` is correct because `en` is the
only locale shipped.

Not audited here, and worth a dedicated pass: colour contrast across the
`stargate.*` and `gray.*` palettes, and the drag-and-drop reordering of voting
options, which has no keyboard alternative (SC 2.1.1).

## Not done here — needs a decision or a backend

- **Policy texts.** Items 1 and 2a can only be closed by editing the published
  policies. The inventory above is the input for that.
- **Server-side consent proof (item 7).** Records currently live only in the
  user's browser, which proves consent _to that user_ but is not an archive the
  organisation holds. Closing this properly needs either Iubenda's Consent
  Database or a first-party endpoint that stores each `ConsentRecord`. Note this
  trades off against collecting less data, so it is a deliberate choice.
- **Self-hosting Google Fonts.** Removes the IP transfer to Google rather than
  merely disclosing it. Left out of this change because it touches build config
  and font loading performance, not compliance plumbing.
- **CCPA/CPRA applicability (item 6).** The opt-out mechanism exists; whether it
  is legally required depends on thresholds only the business can confirm.
- **EAA scope (item 4).** The accessibility fixes stand on their own merit. The
  scope question — whether VeVote is a service in Annex I, and whether the
  micro-enterprise exemption applies — is for counsel.

## When adding a new third-party service

1. Decide its category and add it to `CONSENT_INVENTORY` in
   `apps/frontend/src/types/consent.ts`.
2. If it is not strictly necessary, gate its initialisation on
   `hasConsent(...)` — follow how `MixPanelProvider` does it. Never initialise
   at module import time.
3. Bump `CONSENT_POLICY_VERSION` so existing users are asked again.
4. Update the published Privacy and Cookie policies to match.
