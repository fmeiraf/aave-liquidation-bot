import { client } from "../../apollo/clientConfig";
import { gql } from "@apollo/client/core";
import { UserReserve } from "./fragments";

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

  console.log(result.data.users.length);

  if (result.data.users.length === 0) {
    return "Done";
  }

  return result.data.users;
};
