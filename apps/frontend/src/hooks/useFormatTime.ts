import { useCallback } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useI18nContext } from "@/i18n/i18n-react";

dayjs.extend(duration);

export const useFormatTime = () => {
  const { LL } = useI18nContext();

  const formatTime = useCallback((seconds: number) => {
    if (seconds < 60) {
      return LL.common.time.seconds({ count: seconds });
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return LL.common.time.minutes({ count: minutes });
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return LL.common.time.hours({ count: hours });
    } else {
      const days = Math.floor(seconds / 86400);
      return LL.common.time.days({ count: days });
    }
  }, [LL.common.time]);

  return {
    formatTime,
  };
};