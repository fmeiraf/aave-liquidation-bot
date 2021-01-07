import { client } from "../../apollo/clientConfig";
import { gql } from "@apollo/client/core";
import { UserReserve } from "../graphql/fragments";
import { performance } from "perf_hooks";

const query: any = async function(n: number, pagination: number): Promise<any> {
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
    variables: { n: n, pagination: pagination },
  });

  console.log(result.data.users.length);

  if (result.data.users.length === 0) {
    return "Done";
  }

  return result.data.users;
};

async function execute_query() {
  let n_: number = 100;
  let pag_: number = 0;
  let allUsers: Array<any> = [];

  const t0 = performance.now();
  while (pag_ <= 50000) {
    console.log(`We are at pagination ${pag_}`);
    let new_content = await query(n_, pag_);

    if (new_content === "Done") {
      break;
    }
    allUsers = allUsers.concat(new_content);
    pag_ += 100;
  }

  console.log(allUsers.length);
  console.log(allUsers);

  const t1 = performance.now();

  console.log(`Query execution time (seconds) : ${(t1 - t0) / 1000}`);
}

execute_query();
