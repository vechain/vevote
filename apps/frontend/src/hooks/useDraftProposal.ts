import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { ProposalCardType } from "@/types/proposal";
import dayjs from "dayjs";

export function base64ToBlob(dataUrl?: string, type?: string): Blob {
  if (!dataUrl) throw new Error("Base64 url not found");
  const base64Content = dataUrl.substring("data:image/png;base64,".length);

  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type });
}

export const useDraftProposal = () => {
  const fromDraftToProposal = (
    draftProposal: ProposalCardType | null,
    defaultProposal: ProposalDetails,
  ): ProposalDetails => {
    if (!draftProposal) return defaultProposal;

    const blob = base64ToBlob(draftProposal.headerImage?.url, draftProposal.headerImage?.type);

    return {
      ...draftProposal,
      startDate: dayjs(draftProposal.startDate).toDate(),
      endDate: dayjs(draftProposal.endDate).toDate(),
      headerImage: {
        name: draftProposal.headerImage?.name || "",
        size: draftProposal.headerImage?.size || 0,
        type: draftProposal.headerImage?.type || "",
        url: draftProposal.headerImage?.url || "",
        source: blob,
      },
    };
  };

  const fromProposalToDraft = async (proposalDetails: ProposalDetails): Promise<ProposalCardType> => {
    let base64Url = "";
    const blob = proposalDetails.headerImage?.source;

    base64Url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

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
      },
    };

    return draft;
  };

  return { fromDraftToProposal, fromProposalToDraft };
};
