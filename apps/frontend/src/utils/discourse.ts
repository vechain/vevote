import { getConfig } from "@repo/config";

const discourseBaseUrl = getConfig(import.meta.env.VITE_APP_ENV).discourseBaseUrl;

export const getFullDiscourseUrl = (topic: string): string => {
  return `${discourseBaseUrl}${topic}`;
};

export const getDiscourseTopicUrl = (url: string): string => {
  return url.replace(discourseBaseUrl, "").replace(/^\//, "");
};

export const validateDiscourseTopicExists = async (topicName: string): Promise<boolean> => {
  try {
    if (!topicName.trim()) return false;

    const searchUrl = `${discourseBaseUrl}/search.json?q=${encodeURIComponent(topicName)}`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};
