import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getTimeZone = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = dayjs().tz(userTimeZone);
  const offset = now.format("Z");

  const match = offset.match(/^([+-])(\d{2}):\d{2}$/);
  const shortOffset = match ? `${match[1]}${parseInt(match[2], 10)}` : "+0";

  return `(GMT${shortOffset} ${userTimeZone})`;
};
