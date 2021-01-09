import { client } from "../../apollo/clientConfig";
import { gql } from "@apollo/client/core";
import { UserReserve } from "./fragments";
import _ from "lodash";

// query to get all userResere data from all users, pagination optimzed
export const getAllUsers: any = async function(
  n: number,
  pagination: number
): Promise<any> {
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

  if (result.data.users.length === 0) {
    return "Done";
  }

  return result.data.users;
};

export const loadInitialUsers: any = async function() {
  let n_: number = 100;
  let pag_: number = 0;
  let allUsers: Array<any> = [];

  while (pag_ <= 50000) {
    let new_content = await getAllUsers(n_, pag_);

    if (new_content === "Done") {
      break;
    }
    allUsers = allUsers.concat(new_content);
    pag_ += 100;
  }

  console.log(`${allUsers.length} users added.`);
  return allUsers;
};

export const getLastTimestamps: any = async () => {
  const result: any = await client.query({
    query: gql`
      query getUpdateTimestamps {
        deposits(first: 1, orderBy: timestamp, orderDirection: desc) {
          timestamp
        }
        borrows(first: 1, orderBy: timestamp, orderDirection: desc) {
          timestamp
        }
        liquidationCalls(first: 1, orderBy: timestamp, orderDirection: desc) {
          timestamp
        }
        repays(first: 1, orderBy: timestamp, orderDirection: desc) {
          timestamp
        }
        swaps(first: 1, orderBy: timestamp, orderDirection: desc) {
          timestamp
        }
      }
    `,
  });

  //format query to pass it to db
  let eventTimestamps: any = [];

  _.map(result.data, (obj) => {
    eventTimestamps.push({
      eventName: obj[0].__typename,
      timestamp: obj[0].timestamp,
    });
  });

  return eventTimestamps;
};
