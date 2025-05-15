export type IpfsDetails = {
  ipfsHash?: string;
  title?: string;
  shortDescription?: string;
  markdownDescription?: Record<string, unknown>[];
  headerImage?: {
    name?: string;
    type?: string;
    size?: string;
    url?: string;
  };
};
