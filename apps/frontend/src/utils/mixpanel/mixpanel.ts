import { getConfig } from "@repo/config";
import mixpanel, { Dict } from "mixpanel-browser";

const MIXPANEL_TOKEN = getConfig(import.meta.env.VITE_APP_ENV).mixPanelToken || "";

if (MIXPANEL_TOKEN) {
  mixpanel.init(
    MIXPANEL_TOKEN,
    {
      debug: import.meta.env.DEV,
      track_pageview: false,
      persistence: "localStorage",
      ignore_dnt: true,
      loaded: function (mixpanel) {
        console.log("Mixpanel loaded successfully id:", mixpanel.get_distinct_id());
      },
    },
    "vevote",
  );
} else {
  console.warn("Mixpanel token not found. Make sure your token is set in your environment variables.");
}

export const analytics = {
  track: (eventName: string, properties: Dict = {}) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.vevote.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE,
      });
    } else {
      console.log("Analytics track (dev):", eventName, properties);
    }
  },

  identify: (userId: string) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.vevote.identify(userId);
    }
  },

  setUserProperties: (properties: Dict) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.vevote.people.set(properties);
    }
  },

  reset: () => {
    if (MIXPANEL_TOKEN) {
      mixpanel.vevote.reset();
    }
  },
};

export default mixpanel;
