import { useCallback } from "react";
import dayjs from "dayjs";

export const useFormatDate = () => {
  const leftVotingDate = useCallback((date?: Date) => {
    if (!date) return;
    const dateJs = dayjs(date);
    const days = dateJs.diff(dayjs(), "days");
    const hours = dateJs.diff(dayjs(), "hours") % 24;
    const minutes = dateJs.diff(dayjs(), "minutes") % 60;

    const daysString = days > 1 ? `${days} days and` : days > 0 ? `${days} day` : undefined;
    const hoursString = hours > 0 ? `${hours}h` : undefined;
    const minutesString = minutes > 0 ? `${minutes}min` : undefined;

    if (!daysString && !hoursString && !minutesString) {
      return "Ended";
    }

    return [daysString, hoursString, minutesString].filter(Boolean).join(" ") + " left";
  }, []);

  const formattedDate = useCallback((date?: Date) => {
    if (!date) return;
    return dayjs(date).format("MMM D, YYYY");
  }, []);

  const formattedProposalDate = useCallback((date?: Date) => {
    if (!date) return;
    return dayjs(date).format("DD/MM/YYYY - HH[h]:mm[m]");
  }, []);
  return {
    leftVotingDate,
    formattedDate,
    formattedProposalDate,
  };
};
