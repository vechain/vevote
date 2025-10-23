import { formatAddress } from "@/utils/address";
import { useVechainDomain } from "@vechain/vechain-kit";
import { useMemo } from "react";

export const useVechainDomainOrAddress = (address?: string) => {
  const { data, isLoading, isError } = useVechainDomain(address);

  const addressOrDomain = useMemo(() => {
    if (data?.domain) return data.domain;
    return formatAddress(data?.address || "");
  }, [data?.address, data?.domain]);

  return {
    addressOrDomain,
    isLoading,
    isError,
  };
};
