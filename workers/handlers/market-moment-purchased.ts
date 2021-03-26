import * as t from "@onflow/types";
import * as fs from "fs";
import * as fcl from "@onflow/fcl";
import * as path from "path";
import { getConfig } from "../../config";

const TOPSHOT_CONTRACT_ADDRESS_VAR = "0xTOPSHOTADDRESS";
const MARKET_CONTRACT_ADDRESS_VAR = "0xMARKETADDRESS";

/**
 pub event MomentPurchased(id: UInt64, price: UFix64, seller: Address?)

 Emitted when a user purchases a Moment that is for sale.
 **/

export default async (event, di) => {
  const { data } = event;
  const { id: globalMomentId, seller } = data;
  const { flowService } = di;
  const { contracts } = getConfig();

  const script = fs
    .readFileSync(path.join(__dirname, `../../cadence/sale_moment.cdc`), "utf8")
    .replace(TOPSHOT_CONTRACT_ADDRESS_VAR, contracts.TopShot.address as string)
    .replace(MARKET_CONTRACT_ADDRESS_VAR, contracts.Market.address as string);

  console.log("MomentPurchased payload", data, script);

  const saleMoment = await flowService.executeScript({
    script,
    args: [fcl.arg(seller, t.Address), fcl.arg(globalMomentId, t.UInt64)],
  });

  console.log("saleMoment", saleMoment);
};
