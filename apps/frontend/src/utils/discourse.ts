import { getConfig } from "@repo/config";

const discourseBaseUrl = getConfig(import.meta.env.VITE_APP_ENV).discourseBaseUrl;

export const getFullDiscourseUrl = (topic: string): string => {
  return `${discourseBaseUrl}${topic}`;
};

export const getDiscourseTopicUrl = (url: string): string => {
  return url.replace(discourseBaseUrl, "").replace(/^\//, "");
};

let debounceTimer: number | null = null;
let pendingResolve: ((value: boolean) => void) | null = null;

/**
 * Validates that a Discourse topic exists by issuing a HEAD request to its URL.
 *
 * FAIL-OPEN behaviour: when the fetch resolves we trust its status — a real
 * existence check, which works on origins that Discourse's CORS allowlist
 * permits (e.g. mainnet). When the fetch throws we do NOT reject the link.
 *
 * Form validation runs on every keystroke, so the network call is debounced. A
 * superseded call resolves `true` (the newer call performs the real validation)
 * instead of hanging forever, which was the previous bug.
 */
export const validateDiscourseTopicExists = async (topic: string, delay: number = 500): Promise<boolean> => {
  return new Promise(resolve => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      // Resolve the superseded call so its Promise never hangs; the newer call
      // will perform the real validation.
      if (pendingResolve) pendingResolve(true);
    }

    pendingResolve = resolve;

    debounceTimer = window.setTimeout(async () => {
      debounceTimer = null;
      pendingResolve = null;

      if (!topic.trim()) {
        resolve(false);
        return;
      }

      try {
        // Default redirect-follow is fine: Discourse /t/<slug> redirects to the
        // full path including the numeric id.
        const response = await fetch(getFullDiscourseUrl(topic), { method: "HEAD" });
        resolve(response.ok);
      } catch {
        // A thrown fetch means the browser blocked the cross-origin request
        // (e.g. the testnet origin is not in Discourse's CORS allowlist), so
        // existence cannot be verified client-side and a well-formed link
        // should not be blocked (see issue #526).
        resolve(true);
      }
    }, delay);
  });
};
