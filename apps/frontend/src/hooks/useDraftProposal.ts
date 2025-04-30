import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { ProposalCardType } from "@/types/proposal";
import dayjs from "dayjs";

const base64ToBlob = (base64Data: string, contentType = ""): Blob => {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};

export const useDraftProposal = () => {
  const fromDraftToProposal = (
    draftProposal: ProposalCardType | null,
    defaultProposal: ProposalDetails,
  ): ProposalDetails => {
    if (!draftProposal) return defaultProposal;
    return {
      ...draftProposal,
      startDate: dayjs(draftProposal.startDate).toDate(),
      endDate: dayjs(draftProposal.endDate).toDate(),
    };
  };

  const fromProposalToDraft = async (proposalDetails: ProposalDetails): Promise<ProposalCardType> => {
    let file = proposalDetails.headerImage?.source;
    let base64Url = proposalDetails.headerImage?.url ?? "";

    if (!file && base64Url) {
      file = base64ToBlob(base64Url, proposalDetails.headerImage?.type);
    }

    // Se abbiamo un file valido, creiamo l'URL base64 per l'anteprima
    if (file instanceof Blob) {
      base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const draft: ProposalCardType = {
      ...proposalDetails,
      status: "draft",
      id: "draft",
      proposer: "0x",
      createdAt: new Date(),
      headerImage: {
        name: proposalDetails.headerImage?.name ?? "",
        size: proposalDetails.headerImage?.size ?? 0,
        type: proposalDetails.headerImage?.type ?? "",
        url: base64Url,
        source: file,
      },
    };

    return draft;
  };

  return { fromDraftToProposal, fromProposalToDraft };
};
