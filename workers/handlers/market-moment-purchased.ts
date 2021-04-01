import * as t from "@onflow/types";
import * as fs from "fs";
import * as sdk from "@onflow/sdk";
import * as path from "path";
import hash from "object-hash";
import { getConfig } from "../../config";

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

export default async (event: any, di) => {
  const { data, blockHeight } = event;
  const { id: globalMomentId, seller } = data;
  const { flowService, eventService } = di;
  const { contracts } = getConfig();
  const rawEvent = {
    hashedId: hash(event),
    ...event,
  };

  try {
    const script = fs
      .readFileSync(soldDetailsTemplateScript, "utf8")
      .replace(TOPSHOT_CONTRACT_ADDRESS_VAR, contracts.TopShot.address as string)
      .replace(MARKET_CONTRACT_ADDRESS_VAR, contracts.Market.address as string);

    rawEvent.metadata = await flowService.executeScript({
      script,
      blockHeight: blockHeight - 1,
      args: [sdk.arg(globalMomentId, t.UInt64), sdk.arg(seller, t.Address)],
    });
  } catch (error) {
    console.error(`Error in event metadata: ${rawEvent.blockHeight} - ${error.message}`);
  }

  try {
    await eventService.save(rawEvent);
  } catch (error) {
    console.error(`Error in saving raw event: ${rawEvent.blockHeight}  - ${error.message}`);
  }
};
