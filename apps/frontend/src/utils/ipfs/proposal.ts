import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { IpfsDetails } from "@/types/ipfs";
import { getConfig } from "@repo/config";
import axios from "axios";
import { uploadBlobToIPFS } from "../ipfs";

const IPFS_FETCHING_SERVICE = getConfig(import.meta.env.VITE_APP_ENV).ipfsFetchingService;

export const uploadProposalToIpfs = async ({ title, description, votingQuestion, headerImage }: ProposalDetails) => {
  let headerImageUrl = null;

  if (headerImage?.source) {
    const imageCID = await uploadBlobToIPFS(headerImage?.source, headerImage.name);
    headerImageUrl = `ipfs://${imageCID}`;
  }

  const updatedMetadata = {
    title,
    shortDescription: votingQuestion,
    markdownDescription: description,
    headerImage: {
      type: headerImage?.type,
      name: headerImage?.name,
      size: headerImage?.size,
      url: headerImageUrl,
    },
  };

  try {
    const metadataBlob = new Blob([JSON.stringify(updatedMetadata)], { type: "application/json" });
    return await uploadBlobToIPFS(metadataBlob, "metadata.json");
  } catch (error) {
    console.error("Error uploading proposal to IPFS:", error);
    throw error;
  }
};

export const getProposalsFromIpfs = async (proposalCID: string): Promise<IpfsDetails> => {
  const res = await axios.get(`${IPFS_FETCHING_SERVICE}/${proposalCID}`);
  if (res.status !== 200) throw new Error("ipfs failed");
  return { ipfsHash: proposalCID, ...res.data };
};
