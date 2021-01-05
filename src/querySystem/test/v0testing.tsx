import { client } from "../../apollo/clientConfig";
import { gql } from "@apollo/client/core";
import { UserReserve } from "../graphql/fragments";
import { performance } from "perf_hooks";

const query: any = async () => {
  const t0 = performance.now();
  const result: any = await client.query({
    query: gql`
      query getUsers($n: Int, $pagination: Int) {
        users(first: $n, skip: $pagination) {
          id
          reserves {
            ...UserReserveData
          }
        }
      }
      ${UserReserve.fragment}
    `,
    variables: { n: 50, pagination: 1 },
  });
  const t1 = performance.now();

  console.log(`Query execution time (seconds) : ${(t1 - t0) / 1000}`);
  console.log(result.data.users.length);
  console.log(result.data.users[0].reserves);
};

query();
