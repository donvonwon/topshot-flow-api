import { MongoClient } from "mongodb";

class MomentRanksService {
  private static readonly ACCOUNTS_COLLECTION = "topshotAccounts";
  private static readonly TRANSACTIONS_COLLECTION = "transactions";
  private static readonly USERS_COLLECTION = "users";
  private static readonly MOMENT_COLLECTION = "moments";
  private static readonly MINTS_COLLECTION = "mints";
  private static readonly MOMENTRANKS_DB_NAME = "topshot";

  private readonly client;
  private db;

  constructor(private readonly url: string) {
    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async connect(): Promise<MomentRanksService> {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
    this.db = this.client.db(MomentRanksService.MOMENTRANKS_DB_NAME);
    console.log("Momentranks db connected");
    return this;
  }

  async getMomentByPlayerSet(playerName, setName) {
    return this.db.collection(MomentRanksService.MOMENT_COLLECTION).findOne({
      playerName,
      setName,
    });
  }

  async getMintByGlobalId(momentId) {
    return this.db.collection(MomentRanksService.MINTS_COLLECTION).findOne({
      flowId: momentId,
    });
  }
}

export default MomentRanksService;
