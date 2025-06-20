import mixpanel, { Dict } from "mixpanel-browser";

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || "";

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: true,
    persistence: "localStorage",
    ignore_dnt: true,
    loaded: function (mixpanel) {
      console.log("Mixpanel loaded successfully id:", mixpanel.get_distinct_id());
    },
  });
} else {
  console.warn("Mixpanel token not found. Make sure VITE_MIXPANEL_TOKEN is set in your environment variables.");
}

// Events wrapper
export const analytics = {
  track: (eventName: string, properties: Dict = {}) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.track(eventName, {
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
      mixpanel.identify(userId);
    }
  },

  setUserProperties: (properties: Dict) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.people.set(properties);
    }
  },

  trackPageView: (pageName: string) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.track_pageview({
        page: pageName || window.location.pathname,
      });
    }
  },

  alias: (newId: string) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.alias(newId);
    }
  },

  reset: () => {
    if (MIXPANEL_TOKEN) {
      mixpanel.reset();
    }
  },
};

export default mixpanel;
