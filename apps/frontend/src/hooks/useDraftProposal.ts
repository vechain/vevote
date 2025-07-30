import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { ProposalCardType } from "@/types/proposal";
import { base64ToBlob } from "@/utils/file";
import dayjs from "dayjs";

export const useDraftProposal = () => {
  const fromDraftToProposal = (
    draftProposal: ProposalCardType | null,
    defaultProposal: ProposalDetails,
  ): ProposalDetails => {
    console.log("draftProposal", draftProposal);
    console.log("defaultProposal", defaultProposal);
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

  const fromProposalToDraft = async (proposalDetails: ProposalDetails, proposer: string): Promise<ProposalCardType> => {
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
      proposer,
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
