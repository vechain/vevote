import { getConfig } from "@repo/config";

const discourseBaseUrl = getConfig(import.meta.env.VITE_APP_ENV).discourseBaseUrl;

export const getFullDiscourseUrl = (topic: string): string => {
  return `${discourseBaseUrl}${topic}`;
};
