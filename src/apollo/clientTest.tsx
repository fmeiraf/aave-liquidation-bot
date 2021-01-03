import { client } from "./clientConfig";
import { gql } from "@apollo/client/core";
import { NETWORK } from "../env";

console.log(NETWORK);

const query: any = async () => {
  const result: any = await client.query({
    query: gql`
      {
        userReserves(first: 5) {
          user {
            id
          }
          reserve {
            symbol
          }
          currentATokenBalance
        }
      }
    `,
  });

  console.log(result.data);
};

query();
