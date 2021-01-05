//import { gql } from "@apollo/client/core";
import { UserReserve } from "./fragments";

interface QueryObject {
  query: any;
}

export const GetUser: QueryObject = {
  query: `
  query users(first: $n, skip: $pagination) {
    id
    ...UserReserveData
}
${UserReserve.fragment}
  `,
};
