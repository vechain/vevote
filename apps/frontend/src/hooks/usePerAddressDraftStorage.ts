import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { ProposalCardType } from "@/types/proposal";

type DraftMapping = Record<string, ProposalCardType>;

export function usePerAddressDraftStorage(
  currentAddress?: string,
): [ProposalCardType | null, (draft: ProposalCardType) => void, () => void] {
  const [draftMapping, setDraftMapping] = useLocalStorage<DraftMapping>("draft-proposals", {});

  const currentDraft = useMemo((): ProposalCardType | null => {
    if (!currentAddress) {
      return null;
    }
    return draftMapping[currentAddress] || null;
  }, [currentAddress, draftMapping]);

  const saveDraft = useCallback(
    (draft: ProposalCardType) => {
      if (!currentAddress) {
        console.warn("Cannot save draft: no current address");
        return;
      }

      setDraftMapping(prev => ({
        ...prev,
        [currentAddress]: draft,
      }));
    },
    [currentAddress, setDraftMapping],
  );

  const removeDraft = useCallback(() => {
    if (!currentAddress) {
      console.warn("Cannot remove draft: no current address");
      return;
    }

    setDraftMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[currentAddress];
      return newMapping;
    });
  }, [currentAddress, setDraftMapping]);

  return [currentDraft, saveDraft, removeDraft];
}
