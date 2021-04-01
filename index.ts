import * as fcl from "@onflow/fcl";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { getConfig } from "./config";
import initApp from "./app";
import CursorService from "./services/cursor";
import FlowService from "./services/flow";
import EventService from "./services/event";
import DealService from "./services/deal";
import TopshotService from "./services/topshot";
import MomentRanksService from "./services/momentranks";
import MarketWorker from "./workers/market-worker";
import TopshotWorker from "./workers/topshot-worker";
import DealsWorker from "./workers/deals-worker";

const clientSockets = {};

async function run() {
  const config = getConfig();

  // Initialize services
  const cursorService = new CursorService();
  const flowService = new FlowService();
  const eventService = new EventService();
  const topshotService = new TopshotService(config.topshotGraphQLUrl);
  const momentranksService = await new MomentRanksService(config.mrDatabaseUrl).connect();
  const dealService = new DealService(momentranksService, topshotService);

  // Run API
  const app = initApp(clientSockets);
  const httpServer = createServer(app);

  // Setup topshotBeta DB connection
  await mongoose.connect(config.databaseUrl, {
    dbName: "topshotBeta",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Run deals generator
  const dealsWorker = await new DealsWorker(config, eventService, dealService).run();

  // Setup socket connection
  if (config.frontendUrl) {
    const io = new Server(httpServer, {
      cors: {
        origin: config.frontendUrl,
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket: Socket) => {
      console.log(`Established server socket ${socket.id}`);

      clientSockets[socket.id] = true;

      // Attach worker to socket
      dealsWorker.attach(socket);

      socket.on("disconnect", () => {
        console.log(`Socket disconnected ${socket.id}`);
        dealsWorker.detach();
        delete clientSockets[socket.id];
      });
    });
  }

  httpServer.listen(config.port, async () => {
    console.log(`Listening on port ${config.port}!`);

    // Setup access point node
    fcl.config().put("accessNode.api", config.accessApi);

    console.log("Configured connection with access point", config.accessApi);

    // Run market contract workers
    new MarketWorker(config.contracts.Market, cursorService, flowService, eventService).run();

    // Run topshot contract workers
    new TopshotWorker(config.contracts.TopShot, cursorService, flowService, eventService).run();
  });
}

const redOutput = "\x1b[31m%s\x1b[0m";

run().catch((e) => {
  console.error(redOutput, e);
  process.exit(1);
});
