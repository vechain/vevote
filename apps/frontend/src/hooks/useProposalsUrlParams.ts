import { FilterStatuses } from "@/types/proposal";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_STATUSES: FilterStatuses[] = [
  "approved",
  "canceled",
  "draft",
  "executed",
  "rejected",
  "upcoming",
  "voting",
];

const VALID_STATUSES: FilterStatuses[] = [
  "approved",
  "canceled",
  "draft",
  "executed",
  "rejected",
  "upcoming",
  "voting",
];

export const useProposalsUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchValue = useMemo(() => {
    return searchParams.get("search") || "";
  }, [searchParams]);

  const statuses = useMemo(() => {
    const statusParam = searchParams.get("statuses");
    if (!statusParam) {
      return DEFAULT_STATUSES;
    }

    const statusArray = statusParam.split(",").filter(status => VALID_STATUSES.includes(status as FilterStatuses));

    return statusArray.length > 0 ? statusArray : DEFAULT_STATUSES;
  }, [searchParams]);

  const setSearchValue = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (value.trim()) {
          newParams.set("search", value.trim());
        } else {
          newParams.delete("search");
        }
        return newParams;
      });
    },
    [setSearchParams],
  );

  const setStatuses = useCallback(
    (newStatuses: FilterStatuses[]) => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (
          newStatuses.length === DEFAULT_STATUSES.length &&
          newStatuses.every(status => DEFAULT_STATUSES.includes(status))
        ) {
          // If all default statuses are selected, don't include in URL for cleaner URLs
          newParams.delete("statuses");
        } else if (newStatuses.length > 0) {
          newParams.set("statuses", newStatuses.join(","));
        } else {
          newParams.delete("statuses");
        }
        return newParams;
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("search");
      newParams.delete("statuses");
      return newParams;
    });
  }, [setSearchParams]);

  return {
    searchValue,
    statuses,
    setSearchValue,
    setStatuses,
    clearFilters,
  };
};
