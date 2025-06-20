import { getBlockFromDate } from "@/utils/proposals/helpers";
import { useQuery } from "@tanstack/react-query";

const getBlocksDates = async (startDate?: Date, endDate?: Date) => {
  const [startBlock, durationBlock] = await Promise.all([
    startDate && getBlockFromDate(startDate),
    endDate && getBlockFromDate(endDate),
  ]);

  return {
    startBlock: startBlock?.number,
    durationBlock: durationBlock?.number,
    startBlockId: startBlock?.id,
    durationBlockId: durationBlock?.id,
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
