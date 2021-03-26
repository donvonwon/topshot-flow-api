import * as dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const defaultPort = 3000;
const productionEnv = "production";
const productionDotEnv = ".env";
const localDotEnv = ".env.local";

export function getConfig() {
  const env = dotenv.config({
    path:
      process.env.NODE_ENV === productionEnv ? productionDotEnv : localDotEnv,
  });

  dotenvExpand(env);

  const port = process.env.PORT || defaultPort;

  const accessApi = process.env.FLOW_ACCESS_API;

  const contracts = {
    TopShot: {
      address: process.env.TOPSHOT_CONTRACT_ADDRESS,
      name: "TopShot",
    },
    Market: {
      address: process.env.MARKET_CONTRACT_ADDRESS,
      name: "Market",
    },
  };

  const databaseUrl = process.env.DATABASE_URL;

  return {
    port,
    accessApi,
    databaseUrl,
    contracts,
    blockThreshold: process.env.BLOCK_THRESHOLD,
  };
}
