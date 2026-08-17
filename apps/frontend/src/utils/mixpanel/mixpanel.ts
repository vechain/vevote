import { getConfig } from "@repo/config";
import mixpanel, { Dict } from "mixpanel-browser";

const MIXPANEL_TOKEN = getConfig(import.meta.env.VITE_APP_ENV).mixPanelToken || "";
const MIXPANEL_INSTANCE = "vevote";

/**
 * Mixpanel is a non-essential analytics tracker: it writes to `localStorage`,
 * so under ePrivacy Art. 5(3) it must not run before consent. The SDK is
 * therefore never initialised at import time — `enableAnalytics()` is called by
 * the consent layer once (and only once) the analytics category is granted.
 */
let initialized = false;
let enabled = false;

const canUseMixpanel = () => Boolean(MIXPANEL_TOKEN) && initialized && enabled;

const initOnce = () => {
  if (initialized || !MIXPANEL_TOKEN) return;

  mixpanel.init(
    MIXPANEL_TOKEN,
    {
      debug: import.meta.env.DEV,
      track_pageview: false,
      persistence: "localStorage",
      // Do Not Track / Global Privacy Control are honoured rather than ignored.
      ignore_dnt: false,
      // Belt and braces: even after init nothing is sent until we opt in.
      opt_out_tracking_by_default: true,
      loaded: function (loadedInstance) {
        if (import.meta.env.DEV) {
          console.log("Mixpanel loaded successfully id:", loadedInstance.get_distinct_id());
        }
      },
    },
    MIXPANEL_INSTANCE,
  );

  initialized = true;
};

/** Called by the consent layer when the user grants the analytics category. */
export const enableAnalytics = () => {
  if (!MIXPANEL_TOKEN) {
    if (import.meta.env.DEV) {
      console.warn("Mixpanel token not found. Make sure your token is set in your environment variables.");
    }
    return;
  }

  initOnce();
  enabled = true;
  mixpanel.vevote.opt_in_tracking();
};

/**
 * Called when consent is withheld or withdrawn. Stops collection and clears the
 * identifiers Mixpanel already stored, so a withdrawal actually takes effect.
 */
export const disableAnalytics = () => {
  enabled = false;
  if (!MIXPANEL_TOKEN || !initialized) return;

  try {
    mixpanel.vevote.opt_out_tracking({ clear_persistence: true, delete_user: true });
    mixpanel.vevote.reset();
  } catch (error) {
    console.warn("Unable to opt out of Mixpanel tracking", error);
  }
};

export const analytics = {
  track: (eventName: string, properties: Dict = {}) => {
    if (!canUseMixpanel()) {
      if (import.meta.env.DEV) {
        console.log("Analytics track (skipped, no consent):", eventName, properties);
      }
      return;
    }

    mixpanel.vevote.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
    });
  },

  identify: (userId: string) => {
    if (!canUseMixpanel()) return;
    mixpanel.vevote.identify(userId);
  },

  setUserProperties: (properties: Dict) => {
    if (!canUseMixpanel()) return;
    mixpanel.vevote.people.set(properties);
  },

  reset: () => {
    if (!canUseMixpanel()) return;
    mixpanel.vevote.reset();
  },
};

export default mixpanel;
