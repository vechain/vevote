import { useEffect } from "react";

export const APP_NAME = "VeVote";

/**
 * WCAG 2.4.2 (Page Titled): a single-page app keeps the same `<title>` across
 * routes unless it is updated explicitly, leaving screen reader and tab-strip
 * users without a way to tell pages apart.
 */
export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
};
