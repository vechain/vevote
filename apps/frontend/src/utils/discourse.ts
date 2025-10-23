import { getConfig } from "@repo/config";

let debounceTimer: number | null = null;

const discourseBaseUrl = getConfig(import.meta.env.VITE_APP_ENV).discourseBaseUrl;

export const getFullDiscourseUrl = (topic: string): string => {
  return `${discourseBaseUrl}${topic}`;
};

export const getDiscourseTopicUrl = (url: string): string => {
  return url.replace(discourseBaseUrl, "").replace(/^\//, "");
};

export const validateDiscourseTopicExists = async (topicName: string, delay: number = 500): Promise<boolean> => {
  return new Promise(resolve => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(async () => {
      try {
        if (!topicName.trim()) {
          resolve(false);
          return;
        }

        const url = `${discourseBaseUrl}${encodeURIComponent(topicName)}`;

        const response = await fetch(url, {
          method: "HEAD",
        });

        resolve(response.ok);
      } catch (error) {
        resolve(false);
      }
    }, delay);
  });
};
