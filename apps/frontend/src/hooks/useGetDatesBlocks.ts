import { getBlockFromDate } from "@/utils/proposals/helpers";
import { useQuery } from "@tanstack/react-query";

const getBlocksDates = async (startDate: Date, endDate: Date) => {
  const startBlock = await getBlockFromDate(startDate);
  const durationBlock = await getBlockFromDate(endDate);
  return { startBlock, durationBlock };
};

export const useGetDatesBlocks = ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
  const isEnabled = !!startDate && !!endDate;

  const { data } = useQuery({
    queryKey: ["getDatesBlocks", { startDate, endDate }],
    queryFn: async () => await getBlocksDates(startDate!, endDate!),
    enabled: isEnabled,
  });

  return {
    startBlock: data?.startBlock || 0,
    durationBlock: data?.durationBlock || 0,
  };
};
