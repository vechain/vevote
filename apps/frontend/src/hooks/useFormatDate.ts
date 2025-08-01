import { useCallback } from "react";
import dayjs from "dayjs";

export const useFormatDate = () => {
  const leftVotingDate = useCallback((date?: Date) => {
    if (!date) return;
    const dateJs = dayjs(date);
    const days = dateJs.diff(dayjs(), "days");
    const hours = dateJs.diff(dayjs(), "hours") % 24;
    const minutes = dateJs.diff(dayjs(), "minutes") % 60;

    const daysString = days > 0 ? `${days}d` : undefined;
    const hoursString = `${hours}h`;
    const minutesString = `${minutes}m`;

    return {
      days: daysString,
      hours: hoursString,
      minutes: minutesString,
    };
  }, []);

  const formattedDate = useCallback((date?: Date) => {
    if (!date) return;
    return dayjs(date).format("MMM D, YYYY");
  }, []);

  const formattedProposalDate = useCallback((date?: Date) => {
    if (!date) return;
    return dayjs(date).format("DD/MM/YYYY - HH[h]:mm[m]");
  }, []);

  const formattedProposalCardDate = useCallback(
    (date?: Date) => {
      if (!date) return;
      const { days, hours, minutes } = leftVotingDate(date) || {};
      if (!days) return `${hours} | ${minutes}`;
      return `${days} | ${hours} | ${minutes}`;
    },
    [leftVotingDate],
  );
  return {
    leftVotingDate,
    formattedDate,
    formattedProposalDate,
    formattedProposalCardDate,
  };
};
