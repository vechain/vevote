import {
  ALL_GRANTED_CONSENT_PREFERENCES,
  CONSENT_LOG_MAX_ENTRIES,
  CONSENT_LOG_STORAGE_KEY,
  CONSENT_MAX_AGE_DAYS,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  ConsentCategory,
  ConsentMethod,
  ConsentPreferences,
  ConsentRecord,
  DEFAULT_CONSENT_PREFERENCES,
} from "@/types/consent";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

type CookieConsentContextValue = {
  /** Current effective preferences. Denies everything optional until a decision exists. */
  preferences: ConsentPreferences;
  /** The stored decision, or null if the user has never decided (or it expired). */
  record: ConsentRecord | null;
  /** Full proof-of-consent log, newest first. */
  history: ConsentRecord[];
  /** True while a decision is still required — drives the banner. */
  isBannerOpen: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: ConsentPreferences) => void;
  /** CCPA/CPRA "Do Not Sell or Share": denies every optional category. */
  optOutOfSale: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
  /** Serialises the proof log so the user can download their own consent record. */
  exportProof: () => string;
  hasConsent: (category: ConsentCategory) => boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

const readJson = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn(`Unable to read "${key}" from localStorage`, error);
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to persist "${key}" to localStorage`, error);
  }
};

const isExpired = (record: ConsentRecord) => {
  const ageMs = Date.now() - new Date(record.timestamp).getTime();
  if (Number.isNaN(ageMs)) return true;
  return ageMs > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
};

/** A stored decision only stays valid for the policy version it was given for. */
const isUsable = (record: ConsentRecord | null): record is ConsentRecord =>
  !!record && record.version === CONSENT_POLICY_VERSION && !isExpired(record);

/**
 * Global Privacy Control is a legally recognised opt-out signal under CPRA;
 * Do Not Track is treated the same way here. Either one means "no optional
 * processing" without the user having to click anything.
 */
const readOptOutSignal = (): boolean => {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string };
  const legacyDnt = (window as Window & { doNotTrack?: string }).doNotTrack;
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1" || legacyDnt === "1";
};

const buildRecord = (preferences: ConsentPreferences, method: ConsentMethod): ConsentRecord => ({
  id: uuid(),
  version: CONSENT_POLICY_VERSION,
  timestamp: new Date().toISOString(),
  preferences,
  method,
  context: {
    url: typeof window === "undefined" ? "" : window.location.href,
    language: typeof navigator === "undefined" ? "" : navigator.language,
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
  },
});

export const CookieConsentProvider = ({ children }: PropsWithChildren) => {
  const [record, setRecord] = useState<ConsentRecord | null>(() => {
    const stored = readJson<ConsentRecord>(CONSENT_STORAGE_KEY);
    return isUsable(stored) ? stored : null;
  });
  const [history, setHistory] = useState<ConsentRecord[]>(
    () => readJson<ConsentRecord[]>(CONSENT_LOG_STORAGE_KEY) ?? [],
  );
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);

  const commit = useCallback((preferences: ConsentPreferences, method: ConsentMethod) => {
    const next = buildRecord(preferences, method);
    setRecord(next);
    writeJson(CONSENT_STORAGE_KEY, next);
    setHistory(previous => {
      const updated = [next, ...previous].slice(0, CONSENT_LOG_MAX_ENTRIES);
      writeJson(CONSENT_LOG_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  // Honour a browser-level opt-out signal before the user is ever asked, and
  // record it so there is documentation of why analytics stayed off.
  useEffect(() => {
    if (record || !readOptOutSignal()) return;
    commit(DEFAULT_CONSENT_PREFERENCES, ConsentMethod.SIGNAL);
  }, [record, commit]);

  const acceptAll = useCallback(() => commit(ALL_GRANTED_CONSENT_PREFERENCES, ConsentMethod.ACCEPT_ALL), [commit]);

  const rejectAll = useCallback(() => commit(DEFAULT_CONSENT_PREFERENCES, ConsentMethod.REJECT_ALL), [commit]);

  const savePreferences = useCallback(
    (preferences: ConsentPreferences) =>
      commit({ ...preferences, [ConsentCategory.NECESSARY]: true }, ConsentMethod.CUSTOM),
    [commit],
  );

  const optOutOfSale = useCallback(() => commit(DEFAULT_CONSENT_PREFERENCES, ConsentMethod.OPT_OUT_SALE), [commit]);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const exportProof = useCallback(
    () => JSON.stringify({ policyVersion: CONSENT_POLICY_VERSION, current: record, history }, null, 2),
    [record, history],
  );

  const preferences = useMemo(() => record?.preferences ?? DEFAULT_CONSENT_PREFERENCES, [record]);

  const hasConsent = useCallback((category: ConsentCategory) => preferences[category] === true, [preferences]);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      preferences,
      record,
      history,
      isBannerOpen: record === null,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      optOutOfSale,
      openPreferences,
      closePreferences,
      exportProof,
      hasConsent,
    }),
    [
      preferences,
      record,
      history,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      optOutOfSale,
      openPreferences,
      closePreferences,
      exportProof,
      hasConsent,
    ],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  return context;
};
