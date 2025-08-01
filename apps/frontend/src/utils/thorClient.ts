import { getConfig } from "@repo/config";
import { ThorClient } from "@vechain/vechain-kit";
const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;

export const thorClient = ThorClient.at(nodeUrl);
