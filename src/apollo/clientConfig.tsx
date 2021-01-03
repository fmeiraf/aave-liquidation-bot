import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";
import fetch from "cross-fetch";
import { NETWORK } from "../env";

const graphAddress: any = {
  kovan: "https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan",
  mainnet: "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
};

const activeQueryUrl: string = graphAddress[NETWORK];

const cache: any = new InMemoryCache();
const link: any = new (createHttpLink as any)({
  uri: activeQueryUrl,
  fetch: fetch,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export const client: any = new ApolloClient({
  link: link,
  cache: cache,
});
