import React from "react";
import renderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, test } from "vitest";
import { CookieConsentProvider, useCookieConsent } from "../src/contexts/CookieConsentProvider";
import {
  CONSENT_LOG_STORAGE_KEY,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  ConsentCategory,
  ConsentMethod,
  ConsentRecord,
} from "../src/types/consent";

type Api = ReturnType<typeof useCookieConsent>;

/** Renders the provider and hands the context back for direct assertions. */
const mountConsent = () => {
  const ref: { current: Api | null } = { current: null };

  const Probe = () => {
    ref.current = useCookieConsent();
    return null;
  };

  act(() => {
    renderer.create(
      <CookieConsentProvider>
        <Probe />
      </CookieConsentProvider>,
    );
  });

  return ref as { current: Api };
};

const storedRecord = (): ConsentRecord | null => {
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ConsentRecord) : null;
};

describe("cookie consent", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete (window.navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  });

  test("denies every optional category until the user decides", () => {
    const consent = mountConsent();

    expect(consent.current.isBannerOpen).toBe(true);
    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(false);
    // Strictly necessary storage needs no consent and is always available.
    expect(consent.current.hasConsent(ConsentCategory.NECESSARY)).toBe(true);
    expect(storedRecord()).toBeNull();
  });

  test("accepting grants analytics and dismisses the banner", () => {
    const consent = mountConsent();

    act(() => consent.current.acceptAll());

    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(true);
    expect(consent.current.isBannerOpen).toBe(false);
    expect(storedRecord()?.method).toBe(ConsentMethod.ACCEPT_ALL);
  });

  test("rejecting is recorded and leaves analytics off", () => {
    const consent = mountConsent();

    act(() => consent.current.rejectAll());

    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(false);
    expect(consent.current.isBannerOpen).toBe(false);
    expect(storedRecord()?.method).toBe(ConsentMethod.REJECT_ALL);
  });

  test("stores a full proof record for each decision", () => {
    const consent = mountConsent();

    act(() => consent.current.acceptAll());
    act(() => consent.current.rejectAll());

    const record = storedRecord();
    expect(record).not.toBeNull();
    expect(record?.id).toBeTruthy();
    expect(record?.version).toBe(CONSENT_POLICY_VERSION);
    expect(Number.isNaN(Date.parse(record?.timestamp ?? ""))).toBe(false);
    expect(record?.context.url).toBeTruthy();

    // Both decisions are kept, newest first, so consent history can be produced.
    const log = JSON.parse(window.localStorage.getItem(CONSENT_LOG_STORAGE_KEY) ?? "[]") as ConsentRecord[];
    expect(log).toHaveLength(2);
    expect(log[0].method).toBe(ConsentMethod.REJECT_ALL);
    expect(log[1].method).toBe(ConsentMethod.ACCEPT_ALL);
    expect(JSON.parse(consent.current.exportProof()).history).toHaveLength(2);
  });

  test("withdrawal via the Do Not Sell link overrides an earlier acceptance", () => {
    const consent = mountConsent();

    act(() => consent.current.acceptAll());
    act(() => consent.current.optOutOfSale());

    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(false);
    expect(storedRecord()?.method).toBe(ConsentMethod.OPT_OUT_SALE);
  });

  test("granular preferences always keep the necessary category on", () => {
    const consent = mountConsent();

    act(() =>
      consent.current.savePreferences({
        [ConsentCategory.NECESSARY]: false,
        [ConsentCategory.ANALYTICS]: true,
      }),
    );

    expect(consent.current.hasConsent(ConsentCategory.NECESSARY)).toBe(true);
    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(true);
    expect(storedRecord()?.method).toBe(ConsentMethod.CUSTOM);
  });

  test("consent given against an older policy version is re-asked", () => {
    const stale: ConsentRecord = {
      id: "stale",
      version: CONSENT_POLICY_VERSION - 1,
      timestamp: new Date().toISOString(),
      preferences: { [ConsentCategory.NECESSARY]: true, [ConsentCategory.ANALYTICS]: true },
      method: ConsentMethod.ACCEPT_ALL,
      context: { url: "https://vevote.vechain.org/", language: "en", userAgent: "test" },
    };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stale));

    const consent = mountConsent();

    expect(consent.current.isBannerOpen).toBe(true);
    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(false);
  });

  test("expired consent is re-asked", () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
    const expired: ConsentRecord = {
      id: "expired",
      version: CONSENT_POLICY_VERSION,
      timestamp: twoYearsAgo,
      preferences: { [ConsentCategory.NECESSARY]: true, [ConsentCategory.ANALYTICS]: true },
      method: ConsentMethod.ACCEPT_ALL,
      context: { url: "https://vevote.vechain.org/", language: "en", userAgent: "test" },
    };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(expired));

    const consent = mountConsent();

    expect(consent.current.isBannerOpen).toBe(true);
    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(false);
  });

  test("honours Global Privacy Control without asking", () => {
    Object.defineProperty(window.navigator, "globalPrivacyControl", { value: true, configurable: true });

    const consent = mountConsent();

    expect(consent.current.hasConsent(ConsentCategory.ANALYTICS)).toBe(false);
    expect(consent.current.isBannerOpen).toBe(false);
    expect(storedRecord()?.method).toBe(ConsentMethod.SIGNAL);
  });
});
