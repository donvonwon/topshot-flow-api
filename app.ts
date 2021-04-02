import "express-async-errors";
import express, { Request, Response } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";

// Init all routes, setup middlewares and dependencies
const initApp = (
  clientSockets,
  { cursorService, flowService, eventService, topshotService, momentranksService, dealService }
) => {
  const app = express();

  // @ts-ignore
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: false }));

  app.get("/deals", async (req: Request, res: Response) => {
    const limit = req.params.limit || 50;
    const deals = await dealService.getTopDeals(limit);
    return res.json({
      deals,
    });
  });

  app.get("/account/:value", async (req: Request, res: Response) => {
    const value = req.params.value;
    const account = await momentranksService.getAccount(value);

    if (!account) {
      return res.status(404).json({
        e: "No account found",
      });
    }

    const [transactions, collection] = await Promise.all([
      momentranksService.getAccountTransactions(account.flowAddress),
      momentranksService.getAccountCollection(account.flowAddress),
    ]);

    return res.json({
      account,
      transactions,
      collection,
    });
  });

  app.get("/blockchain", async (req: Request, res: Response) => {
    const [momentPurchased, momentListed, total] = await Promise.all([
      cursorService.findByEventName("A.c1e4f4f4c4257510.Market.MomentPurchased"),
      cursorService.findByEventName("A.c1e4f4f4c4257510.Market.MomentListed"),
      eventService.getTotalEvents(),
    ]);

    return res.json({
      cursors: {
        momentPurchased,
        momentListed,
      },
      events: {
        total,
      },
    });
  });

  app.get("/connections", async (req: Request, res: Response) => {
    return res.json({
      sockets: clientSockets,
    });
  });

  app.get("/health", async (req: Request, res: Response) => {
    return res.json({
      ts: new Date(),
      up: true,
    });
  });

  // Add routes for public api
  app.all("*", async (req: Request, res: Response) => {
    return res.sendStatus(404);
  });

  return app;
};

export default initApp;
