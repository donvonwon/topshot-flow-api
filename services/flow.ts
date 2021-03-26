import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import { resolveCadence } from "@onflow/sdk-resolve-cadence";

const ec: EC = new EC("p256");

class Flow {
  constructor() {}

  getAccount = async (addr: string) => {
    const { account } = await fcl.send([fcl.getAccount(addr)]);
    return account;
  };

  private signWithKey = (privateKey: string, msg: string) => {
    const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));
    const sig = key.sign(this.hashMsg(msg));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    return Buffer.concat([r, s]).toString("hex");
  };

  private hashMsg = (msg: string) => {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msg, "hex"));
    return sha.digest();
  };

  sendTx = async ({
    transaction,
    args,
    proposer,
    authorizations,
    payer,
  }): Promise<any> => {
    const response = await fcl.send([
      fcl.transaction`
        ${transaction}
      `,
      fcl.args(args),
      fcl.proposer(proposer),
      fcl.authorizations(authorizations),
      fcl.payer(payer),
      fcl.limit(9999),
    ]);
    return await fcl.tx(response).onceSealed();
  };

  async executeScript<T>({ script, blockHeight, args }): Promise<T> {
    const interaction = await sdk.build([
      sdk.script(script),
      sdk.atBlockHeight(blockHeight),
      sdk.args(args),
    ]);

    const pipe = await sdk.pipe(interaction, [
      sdk.resolveArguments,
      sdk.resolveCadence,
    ]);

    return await sdk.decode(await sdk.send(pipe));
  }

  async getLatestBlockHeight(isSealed = true) {
    const block = await sdk.send(sdk.build([sdk.getBlock(isSealed)]));
    const decoded = await sdk.decode(block);
    return decoded.height;
  }
}

export default Flow;
