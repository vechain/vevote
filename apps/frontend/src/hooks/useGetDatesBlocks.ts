import { getBlockFromDate } from "@/utils/proposals/helpers";
import { useQuery } from "@tanstack/react-query";

const getBlocksDates = async (startDate?: Date, endDate?: Date) => {
  const [startBlock, endBlock] = await Promise.all([
    startDate ? getBlockFromDate(startDate) : Promise.resolve(null),
    endDate ? getBlockFromDate(endDate) : Promise.resolve(null),
  ]);

  return {
    startBlock: startBlock?.number || 0,
    endBlock: endBlock?.number || 0,
    startBlockId: startBlock?.id || undefined,
    endBlockId: endBlock?.id || undefined,
  };
};

export const useGetDatesBlocks = ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
  const { data } = useQuery({
    queryKey: ["getDatesBlocks", { startDate, endDate }],
    queryFn: () => getBlocksDates(startDate, endDate),
  });

  return {
    startBlock: data?.startBlock || 0,
    endBlock: data?.endBlock || 0,
    startBlockId: data?.startBlockId || undefined,
    endBlockId: data?.endBlockId || undefined,
  };
};
