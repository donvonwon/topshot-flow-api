import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { MOMENT_LISTING_QUERY, MINTED_MOMENT_QUERY } from "./queries/topshot";
import "cross-fetch/polyfill";

class TopShotService {
  private topshotClient;

  constructor(private readonly uri: string) {
    this.topshotClient = new ApolloClient({
      ssrMode: false,
      link: new HttpLink({
        uri,
        credentials: "same-origin",
        headers: {
          "User-Agent": "momentranks.com / v1 / public-api-integration",
        },
      }),
      cache: new InMemoryCache({
        resultCaching: false,
      }),
    });
  }

  async getMomentListings(setId: string, playId: string) {
    const {
      data: {
        getUserMomentListings: { data },
      },
    } = await this.topshotClient.query({
      operationName: "GetUserMomentListingsDedicated",
      query: MOMENT_LISTING_QUERY,
      variables: {
        input: { setID: setId, playID: playId },
      },
    });

    return data;
  }

  async getMintedMoment(momentId: string) {
    const {
      data: {
        getMintedMoment: { data },
      },
    } = await this.topshotClient.query({
      operationName: "GetMintedMoment",
      query: MINTED_MOMENT_QUERY,
      variables: {
        momentID: momentId,
      },
    });

    return data;
  }
}

export default TopShotService;
