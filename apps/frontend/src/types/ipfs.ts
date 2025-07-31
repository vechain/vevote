export type IpfsDetails = {
  ipfsHash?: string;
  title?: string;
  shortDescription?: string;
  markdownDescription?: Record<string, unknown>[];
  headerImage?: {
    name?: string;
    type?: string;
    size?: number;
    url?: string;
  };
  discourseUrl?: string;
};
