import { getBlockFromDate } from "@/utils/proposals/helpers";
import { useQuery } from "@tanstack/react-query";

const getBlocksDates = async (startDate?: Date, endDate?: Date) => {
  const [startBlock, durationBlock] = await Promise.all([
    startDate ? getBlockFromDate(startDate) : Promise.resolve(null),
    endDate ? getBlockFromDate(endDate) : Promise.resolve(null),
  ]);

  return {
    startBlock: startBlock?.number || 0,
    durationBlock: durationBlock?.number || 0,
    startBlockId: startBlock?.id || undefined,
    durationBlockId: durationBlock?.id || undefined,
  };
};

export const useGetDatesBlocks = ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
  const { data } = useQuery({
    queryKey: ["getDatesBlocks", { startDate, endDate }],
    queryFn: async () => await getBlocksDates(startDate, endDate),
  });

  return {
    startBlock: data?.startBlock || 0,
    durationBlock: data?.durationBlock || 0,
    startBlockId: data?.startBlockId || undefined,
    durationBlockId: data?.durationBlockId || undefined,
  };
};
