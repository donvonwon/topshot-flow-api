import * as t from "@onflow/types";
import * as fs from "fs";
import * as sdk from "@onflow/sdk";
import * as path from "path";
import hash from "object-hash";
import { getConfig } from "../../config";

const listWithdrawnTemplateScript = path.join(
  __dirname,
  `../../cadence/scripts/moment_withdrawn_details.cdc`
);
const TOPSHOT_CONTRACT_ADDRESS_VAR = "0xTOPSHOTADDRESS";
const MARKET_CONTRACT_ADDRESS_VAR = "0xMARKETADDRESS";

/**
 pub event MomentWithdrawn(id: UInt64, owner: Address?)

 Emitted when a seller withdraws their Moment from their SaleCollection.
 **/

export default async (event: any, di) => {
  const { data, blockHeight } = event;
  const { id: globalMomentId, owner } = data;
  const { flowService, eventService } = di;
  const { contracts } = getConfig();

  const rawEvent = {
    hashedId: hash(event),
    ...event,
  };

  try {
    const script = fs
      .readFileSync(listWithdrawnTemplateScript, "utf8")
      .replace(TOPSHOT_CONTRACT_ADDRESS_VAR, contracts.TopShot.address as string)
      .replace(MARKET_CONTRACT_ADDRESS_VAR, contracts.Market.address as string);

    rawEvent.metadata = await flowService.executeScript({
      script,
      blockHeight: blockHeight - 1,
      args: [sdk.arg(globalMomentId, t.UInt64), sdk.arg(owner, t.Address)],
    });
  } catch (error) {
    console.log("error", error.message);
    console.error(`Error in event metadata: ${rawEvent.blockHeight}`);
  }

  try {
    await eventService.save(rawEvent);
  } catch (error) {
    console.error(error);
  }
};
