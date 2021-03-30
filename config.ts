import * as dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const defaultPort = "6999";
const productionEnv = "production";
const productionDotEnv = ".env";
const localDotEnv = ".env.local";

interface IConfig {
  port: number;
  accessApi: string;
  databaseUrl: string;
  contracts: any;
}

export function getConfig(): IConfig {
  const env = dotenv.config({
    path:
      process.env.NODE_ENV === productionEnv ? productionDotEnv : localDotEnv,
  });

  dotenvExpand(env);

  const port = parseInt(process.env.PORT || defaultPort, 10);

  const accessApi = process.env.FLOW_ACCESS_API || "";

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

  const databaseUrl = process.env.DATABASE_URL || "";

  return {
    port,
    accessApi,
    databaseUrl,
    contracts,
  };
}
