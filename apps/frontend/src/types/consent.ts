/**
 * Cookie / tracker consent model.
 *
 * Scope note: under ePrivacy (Art. 5(3)) the consent requirement covers *any*
 * storing of or access to information on the user's device, not only HTTP
 * cookies. Everything VeVote persists in `localStorage` is therefore in scope
 * and is classified below.
 */

/**
 * Bump whenever the set of services in a category changes, or when the cookie
 * policy is materially updated. A stored consent carrying an older version is
 * treated as expired and the banner is shown again.
 */
export const CONSENT_POLICY_VERSION = 1;

/** Consent is re-asked after this many days (GDPR guidance: max 12 months). */
export const CONSENT_MAX_AGE_DAYS = 365;

export const CONSENT_STORAGE_KEY = "vevote_cookie_consent";
/** Append-only proof log, kept so the user can be shown/handed their own record. */
export const CONSENT_LOG_STORAGE_KEY = "vevote_cookie_consent_log";
export const CONSENT_LOG_MAX_ENTRIES = 20;

export enum ConsentCategory {
  /** Strictly necessary: cannot be switched off, no consent required. */
  NECESSARY = "necessary",
  /** Product analytics (Mixpanel). Off until explicitly enabled. */
  ANALYTICS = "analytics",
}

/** How the decision was expressed — recorded as part of the proof of consent. */
export enum ConsentMethod {
  ACCEPT_ALL = "accept_all",
  REJECT_ALL = "reject_all",
  CUSTOM = "custom",
  /** CCPA/CPRA-style global opt-out from the "Do Not Sell or Share" link. */
  OPT_OUT_SALE = "opt_out_sale",
  /** Browser-level opt-out signal (Global Privacy Control / Do Not Track). */
  SIGNAL = "signal",
}

export type ConsentPreferences = Record<ConsentCategory, boolean>;

/**
 * A single consent event. Persisted verbatim so it can be produced as evidence
 * that consent was collected, when, for what, and how.
 */
export type ConsentRecord = {
  /** Stable identifier for this specific consent event. */
  id: string;
  /** Version of the cookie policy the user consented to. */
  version: number;
  /** ISO-8601 timestamp of the decision. */
  timestamp: string;
  preferences: ConsentPreferences;
  method: ConsentMethod;
  /** Context captured at decision time. */
  context: {
    url: string;
    language: string;
    userAgent: string;
  };
};

/** Categories the user can actually toggle (NECESSARY is always granted). */
export const OPTIONAL_CONSENT_CATEGORIES = [ConsentCategory.ANALYTICS] as const;

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = {
  [ConsentCategory.NECESSARY]: true,
  [ConsentCategory.ANALYTICS]: false,
};

export const ALL_GRANTED_CONSENT_PREFERENCES: ConsentPreferences = {
  [ConsentCategory.NECESSARY]: true,
  [ConsentCategory.ANALYTICS]: true,
};

/**
 * Services/storage in each category, mirrored in `docs/Compliance.md` and in the
 * published cookie policy. Keeping the inventory in code makes drift visible.
 */
export const CONSENT_INVENTORY: Record<ConsentCategory, string[]> = {
  [ConsentCategory.NECESSARY]: [
    "vevote_cookie_consent",
    "vevote_cookie_consent_log",
    "REACT_QUERY_OFFLINE_CACHE",
    "vechain-kit / dapp-kit wallet session",
    "WalletConnect (Reown) session",
  ],
  [ConsentCategory.ANALYTICS]: ["Mixpanel", "mixpanel_user_id", "vevote_last_tracked_wallet"],
};
