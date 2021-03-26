import "express-async-errors";
import express, { Request, Response } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";

const v1 = "/v1/";

// Init all routes, setup middlewares and dependencies
const initApp = () => {
  const app = express();

  // @ts-ignore
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: false }));

  app.all("*", async (req: Request, res: Response) => {
    return res.sendStatus(404);
  });

  return app;
};

export default initApp;
