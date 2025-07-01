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
    };
  }
}
