import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "./useDebounce";
import { ProposalStatus } from "@/types/proposal";

const DEFAULT_STATUSES: ProposalStatus[] = [
  ProposalStatus.APPROVED,
  ProposalStatus.CANCELED,
  ProposalStatus.DRAFT,
  ProposalStatus.EXECUTED,
  ProposalStatus.REJECTED,
  ProposalStatus.UPCOMING,
  ProposalStatus.VOTING,
  ProposalStatus.MIN_NOT_REACHED,
];

const VALID_STATUSES: ProposalStatus[] = [
  ProposalStatus.APPROVED,
  ProposalStatus.CANCELED,
  ProposalStatus.DRAFT,
  ProposalStatus.EXECUTED,
  ProposalStatus.REJECTED,
  ProposalStatus.UPCOMING,
  ProposalStatus.VOTING,
  ProposalStatus.MIN_NOT_REACHED,
];

export const useProposalsUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchValue = useMemo(() => {
    return searchParams.get("search") || "";
  }, [searchParams]);

  const [searchInput, setSearchInput] = useState(searchValue);

  const debouncedSearchInput = useDebounce(searchInput, 500);

  const statuses = useMemo(() => {
    const statusParam = searchParams.get("statuses");
    if (!statusParam) {
      return DEFAULT_STATUSES;
    }

    const statusArray = statusParam.split(",").filter(status => VALID_STATUSES.includes(status as ProposalStatus));

    return statusArray.length > 0 ? (statusArray as ProposalStatus[]) : DEFAULT_STATUSES;
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

  const setSearchInputValue = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  const setStatuses = useCallback(
    (newStatuses: ProposalStatus[]) => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (
          newStatuses.length === DEFAULT_STATUSES.length &&
          newStatuses.every(status => DEFAULT_STATUSES.includes(status))
        ) {
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
    setSearchInput("");
  }, [setSearchParams]);

  useEffect(() => {
    if (debouncedSearchInput !== searchValue) {
      setSearchValue(debouncedSearchInput);
    }
  }, [debouncedSearchInput, searchValue, setSearchValue]);

  return {
    searchValue,
    searchInput,
    statuses,
    setSearchValue,
    setSearchInput: setSearchInputValue,
    clearSearch,
    setStatuses,
    clearFilters,
  };
};
