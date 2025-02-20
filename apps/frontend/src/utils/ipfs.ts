import { getConfig } from "@repo/config"
import axios from "axios"

export async function uploadBlobToIPFS(blob: Blob, filename: string): Promise<string> {
  try {
    const form = new FormData()
    form.append("file", blob, filename)
    const response = await axios.post(getConfig(import.meta.env.VITE_APP_ENV).ipfsPinningService, form)

    const ipfsHash = response.data.IpfsHash
    console.log("IPFS Hash:", ipfsHash)

    return ipfsHash
  } catch (error) {
    console.error("Error uploading blob:", error)
    throw new Error("Failed to upload blob to IPFS")
  }
}

export async function getProposalFromIPFS(proposalId: string) {
  try {
    const response = await axios.get(`${getConfig(import.meta.env.VITE_APP_ENV).ipfsFetchingService}/${proposalId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching proposal form from IPFS:", error)
    throw new Error("Failed to fetch proposal form from IPFS")
  }
}
