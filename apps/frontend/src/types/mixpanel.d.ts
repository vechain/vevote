import { Dict } from "mixpanel-browser";

declare module "mixpanel-browser" {
  interface OverridedMixpanel {
    vevote: {
      track: (event: string, properties?: Dict) => void;
      identify: (userId: string) => void;
      people: {
        set: (properties: Dict) => void;
      };
      track_pageview: (properties: Dict) => void;
      reset: () => void;
      get_distinct_id: () => string;
      /** Starts collection. Only called once the analytics consent category is granted. */
      opt_in_tracking: () => void;
      /** Stops collection and wipes the identifiers already stored on the device. */
      opt_out_tracking: (options?: { clear_persistence?: boolean; delete_user?: boolean }) => void;
    };
  }
}
