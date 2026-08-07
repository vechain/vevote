import { getConfig } from "@repo/config";

const discourseBaseUrl = getConfig(import.meta.env.VITE_APP_ENV).discourseBaseUrl;

export const getFullDiscourseUrl = (topic: string): string => {
  return `${discourseBaseUrl}${topic}`;
};

export const getDiscourseTopicUrl = (url: string): string => {
  return url.replace(discourseBaseUrl, "").replace(/^\//, "");
};

// Matches a Discourse topic path: a slug (unicode letters/digits/hyphens/underscores)
// optionally followed by /<numericId>, e.g. "my-topic" or "my-topic/12345".
const TOPIC_SLUG_REGEX = /^[\p{L}\p{N}_-]+(?:\/\d+)?$/u;
// Matches a purely numeric topic id, e.g. "12345".
const TOPIC_ID_REGEX = /^\d+$/;

/**
 * Validates a Discourse topic link by its FORMAT rather than by asserting the
 * topic exists.
 *
 * Existence cannot be verified from the browser: the app is a static SPA with no
 * backend, and vechain.discourse.group serves no CORS headers, so any cross-origin
 * fetch to check existence always throws and every valid topic was wrongly rejected
 * (see issue #526). Instead we accept anything that looks like a valid topic path.
 *
 * Accepts either a bare topic path (the field shows the base URL as a read-only
 * addon) or a full pasted URL, which is normalized to its topic path first.
 */
export const validateDiscourseTopicExists = (topic: string): boolean => {
  const trimmed = topic.trim();
  if (!trimmed) return false;

  // If a full URL was pasted, strip the configured base URL to get the topic path.
  const path = /^https?:\/\//i.test(trimmed) ? getDiscourseTopicUrl(trimmed).trim() : trimmed;

  if (!path || /\s/.test(path)) return false;

  return TOPIC_SLUG_REGEX.test(path) || TOPIC_ID_REGEX.test(path);
};
