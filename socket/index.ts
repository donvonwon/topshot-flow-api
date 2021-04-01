const { ApolloClient, HttpLink, InMemoryCache, gql } = require("@apollo/client");
const { MongoClient } = require("mongodb");
const get = require("lodash/get");
const pick = require("lodash/pick");
const keyBy = require("lodash/keyBy");

const profitToDealStrength = (profitMargin) => {
  if (profitMargin < 0.15) {
    return 0;
  } else if (profitMargin >= 0.15 && profitMargin < 0.45) {
    return 1;
  } else if (profitMargin >= 0.45 && profitMargin < 0.65) {
    return 2;
  } else if (profitMargin >= 0.65 && profitMargin < 1.0) {
    return 3;
  } else if (profitMargin >= 1.0 && profitMargin < 5) {
    return 4;
  } else if (profitMargin >= 1.5) {
    return 5;
  }
};

const getListings = async (client, setId, playId) => {
  const {
    data: {
      getUserMomentListings: { data },
    },
  } = await client.query({
    operationName: "GetUserMomentListingsDedicated",
    query: gql`
      query GetUserMomentListingsDedicated($input: GetUserMomentListingsInput!) {
        getUserMomentListings(input: $input) {
          data {
            circulationCount
            priceRange {
              min
              max
              __typename
            }
            momentListings {
              id
              moment {
                id
                price
                flowSerialNumber
                owner {
                  dapperID
                  username
                  profileImageUrl
                  __typename
                }
                __typename
              }
              __typename
            }
            momentListingCount
            __typename
          }
          __typename
        }
      }
    `,
    variables: {
      input: { setID: setId, playID: playId },
    },
  });

  return data;
};

const connectSocket = async (socket) => {
  console.log(`Server socket established ${socket.id}`);

  const tsClient = new ApolloClient({
    ssrMode: false,
    link: new HttpLink({
      uri: "https://public-api.nbatopshot.com/graphql?",
      credentials: "same-origin",
      headers: {
        "User-Agent": "momentranks.com / v1 / public-api-integration",
      },
    }),
    cache: new InMemoryCache({
      resultCaching: false,
    }),
  });

  const client = new MongoClient(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  if (!client.isConnected()) {
    await client.connect();
  }

  const dbMain = client.db("topshot");
  const db = client.db("topshotBeta");

  // Listing watcher
  const listingStream = await db.collection("rawevents").watch([
    {
      $match: {
        "fullDocument.type": "A.c1e4f4f4c4257510.Market.MomentListed",
      },
    },
  ]);

  // Purchase watcher
  const purchaseStream = await db.collection("rawevents").watch([
    {
      $match: {
        "fullDocument.type": "A.c1e4f4f4c4257510.Market.MomentPurchased",
      },
    },
  ]);

  purchaseStream.on("change", async (change) => {
    if (change.fullDocument) {
      const { hashedId, blockHeight, blockTimestamp, data, metadata } = change.fullDocument;

      // // TODO: For market buying feed
      // const [moment, mint] = await Promise.all([
      //   dbMain.collection("moments").findOne({
      //     playerName: get(metadata, "play.FullName"),
      //     setName: get(metadata, "setName"),
      //   }),
      //   dbMain.collection("mints").findOne({
      //     flowId: get(metadata, "id"),
      //   }),
      // ]);
      //
      // if (moment && mint) {
      //   // Emit for markets live feed
      //   socket.emit("market.bought", {
      //     _id: String(get(metadata, "id")),
      //     hashedId,
      //     blockHeight,
      //     blockTimestamp,
      //     price: data.price,
      //     playDate: moment.date,
      //     ...pick(moment, [
      //       "setId",
      //       "playId",
      //       "inCirculation",
      //       "setName",
      //       "seriesNumber",
      //       "playerName",
      //       "jerseyNumber",
      //       "imageURL",
      //       "floorPrice",
      //       "playCategory",
      //     ]),
      //     ...pick(mint, ["MRvalue", "serialNumber"]),
      //   });
      // }

      try {
        const deal = await db.collection("deals").findOneAndUpdate(
          {
            _id: String(get(metadata, "id")),
          },
          [
            {
              $set: {
                isBought: true,
                updatedAt: new Date(),
              },
            },
          ],
          {
            upsert: false,
            returnNewDocument: true,
          }
        );

        if (deal.value) {
          // Deals bought
          socket.emit("deals.bought", deal.value);
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  });

  listingStream.on("change", async (change) => {
    const changeKey = change.documentKey._id;

    if (change.fullDocument) {
      const {
        hashedId,
        blockHeight,
        blockTimestamp,
        data,
        createdAt,
        updatedAt,
        metadata,
      } = change.fullDocument;

      try {
        const [moment, mint] = await Promise.all([
          dbMain.collection("moments").findOne({
            playerName: get(metadata, "play.FullName"),
            setName: get(metadata, "setName"),
          }),
          dbMain.collection("mints").findOne({
            flowId: get(metadata, "id"),
          }),
        ]);

        if (!moment || !mint) {
          return;
        }

        const { MRvalue } = mint;
        const profitMargin = (MRvalue - data.price) / data.price;
        const dealStrength = profitToDealStrength(profitMargin);
        const momentId = get(metadata, "id");

        const dealParams = {
          _id: String(momentId),
          hashedId,
          blockHeight,
          blockTimestamp,
          price: data.price,
          sellerAddress: data.seller,
          createdAt,
          updatedAt,
          profitMargin,
          dealStrength,
          playDate: moment.date,
          ...pick(moment, [
            "setId",
            "playId",
            "inCirculation",
            "setName",
            "seriesNumber",
            "playerName",
            "jerseyNumber",
            "imageURL",
            "floorPrice",
            "playCategory",
          ]),
          ...pick(mint, ["MRvalue", "serialNumber"]),
          isBought: false, // Updated with purchase listings
        };

        if (dealStrength > 0) {
          // Send optimistically
          // console.log(`Emitting ${dealParams.playerName} w/ Deal: ${dealStrength}`);
          // socket.emit("deals.listed", dealParams);

          const findMomentListing = async () => {
            try {
              const data = await getListings(tsClient, moment.setId, moment.playId);

              if (data) {
                const momentListingLookup = keyBy(data.momentListings, "moment.flowSerialNumber");
                dealParams.listing = momentListingLookup[String(mint.serialNumber)];
                dealParams.priceRange = data.priceRange;
                dealParams.listingCount = data.momentListingCount;
                return dealParams;
              }
            } catch (e) {
              console.log(e.message);
            }
          };

          const persistDeal = async (deal) => {
            console.log(`Emitting ${dealParams.playerName} w/ Deal: ${dealStrength}`);
            socket.emit("deals.listed", deal);
            await db.collection("deals").replaceOne(
              {
                _id: String(get(metadata, "id")),
              },
              deal,
              {
                upsert: true,
              }
            );
            console.log(`Saved deal for ${deal.playerName} Deal: ${deal.dealStrength}`);
          };

          const retrySleepMs = 1000;
          const MAX_RETRIES = 3;

          const performFind = async (retries) => {
            let newRetry = retries + 1;
            if (retries > MAX_RETRIES) {
              console.log("Could not find TS listing", dealParams.playerName);
              return;
            }

            const found = await findMomentListing();

            if (found.listing) {
              await persistDeal(found);
            } else {
              // Sleep before next request of data
              await new Promise((resolve) => setTimeout(resolve, retrySleepMs));
              await performFind(newRetry);
            }
          };

          // Run retry find
          await performFind(0);
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`disconnect ${socket.id}`);
  });
};

module.exports = connectSocket;
