import * as t from "@onflow/types";
import * as fs from "fs";
import * as sdk from "@onflow/sdk";
import * as path from "path";
import pick from "lodash/pick";
import hash from "object-hash";
import { getConfig } from "../../config";

interface IMomentPurchasedEvent {
  blockId: string;
  blockHeight: number;
  blockTimestamp: string;
  type: string;
  transactionId: string;
  transactionIndex: number;
  eventIndex: number;
  data: {
    id: number;
    price: string;
    seller: string;
  };
}

const soldDetailsTemplateScript = path.join(
  __dirname,
  `../../cadence/scripts/moment_sold_details.cdc`
);
const TOPSHOT_CONTRACT_ADDRESS_VAR = "0xTOPSHOTADDRESS";
const MARKET_CONTRACT_ADDRESS_VAR = "0xMARKETADDRESS";

/**
 pub event MomentPurchased(id: UInt64, price: UFix64, seller: Address?)

 Emitted when a user purchases a Moment that is for sale.
 **/

export default async (event: IMomentPurchasedEvent, di) => {
  const { data, blockHeight } = event;
  const { id: globalMomentId, seller } = data;
  const { flowService, workerService } = di;
  const { contracts } = getConfig();

  try {
    const script = fs
      .readFileSync(soldDetailsTemplateScript, "utf8")
      .replace(
        TOPSHOT_CONTRACT_ADDRESS_VAR,
        contracts.TopShot.address as string
      )
      .replace(MARKET_CONTRACT_ADDRESS_VAR, contracts.Market.address as string);

    console.log("MomentPurchased incoming event \n", event, "\n");

    const metadata = await flowService.executeScript({
      script,
      blockHeight: blockHeight - 1,
      args: [sdk.arg(seller, t.Address), sdk.arg(globalMomentId, t.UInt64)],
    });

    const savedEvent = await workerService.saveRawEvent({
      hashedId: hash(event), // Use for finding the same event
      ...pick(event, [
        "blockId",
        "blockHeight",
        "blockTimestamp",
        "type",
        "transactionId",
        "transactionIndex",
        "eventIndex",
      ]),
      metadata,
    });

    console.log("MomentPurchased saved \n", savedEvent, "\n");
  } catch (error) {
    console.error(error);
  }
};
