import { client } from "../../apollo/clientConfig";
import { gql } from "@apollo/client/core";
import { UserReserve, ReserveData } from "./fragments";
import { User } from "../dbTypes";
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
  let allUsers: Array<User> = [];

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

export const getUsersToUpdate: any = async (
  borrowLast: number,
  depositLast: number,
  liquidationLast: number,
  repayLast: number,
  swapLast: number
) => {
  const result: any = await client.query({
    query: gql`
      query udpateUserData(
        $borrowLast: Int
        $depositLast: Int
        $liquidationLast: Int
        $repayLast: Int
        $swapLast: Int
      ) {
        deposits(
          where: { timestamp_gt: $depositLast }
          orderBy: timestamp
          orderDirection: desc
        ) {
          onBehalfOf {
            id
          }
        }
        borrows(
          where: { timestamp_gt: $borrowLast }
          orderBy: timestamp
          orderDirection: desc
        ) {
          onBehalfOf {
            id
          }
        }
        liquidationCalls(
          where: { timestamp_gt: $liquidationLast }
          orderBy: timestamp
          orderDirection: desc
        ) {
          user {
            id
          }
        }
        repays(
          where: { timestamp_gt: $repayLast }
          orderBy: timestamp
          orderDirection: desc
        ) {
          onBehalfOf {
            id
          }
        }
        swaps(
          where: { timestamp_gt: $swapLast }
          orderBy: timestamp
          orderDirection: desc
        ) {
          user {
            id
          }
        }
      }
    `,
    variables: {
      borrowLast: borrowLast,
      depositLast: depositLast,
      liquidationLast: liquidationLast,
      repayLast: repayLast,
      swapLast: swapLast,
    },
  });

  //format query to pass it to db
  const events: Array<string> = [
    "borrows",
    "deposits",
    "liquidationCalls",
    "repays",
    "swaps",
  ];
  let usersToUpdate: Array<string> = [];

  for (var event of events) {
    if (result.data[event] !== []) {
      _.map(result.data[event], (obj) => {
        if (event === "swaps" || event == "liquidationCalls") {
          usersToUpdate.push(obj.user.id);
        } else {
          usersToUpdate.push(obj.onBehalfOf.id);
        }
      });
    }
  }

  return _.uniq(usersToUpdate);
};

export const getUserData: any = async function(
  userAddress: string
): Promise<any> {
  const result = await client.query({
    query: gql`
      query getUserData($userId: String) {
        user(id: $userId) {
          id
          reserves {
            ...UserReserveData
          }
        }
      }
      ${UserReserve.fragment}
    `,
    variables: {
      userId: userAddress,
    },
  });

  return result.data.user;
};

export const getReservesData: any = async function() {
  const result: any = await client.query({
    query: gql`
      query getReserves {
        reserves {
          ...ReserveData
        }
      }
      ${ReserveData.fragment}
    `,
  });

  return result.data.reserves;
};

export const getBlockNumber: any = async function() {
  const result: any = await client.query({
    query: gql`
      query getBlockNumber {
        _meta {
          block {
            number
          }
        }
      }
    `,
  });

  return result.data._meta;
};
