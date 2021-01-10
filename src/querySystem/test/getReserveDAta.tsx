import { getReservesData } from "../graphql/queries";

const execute = async () => {
  const data = await getReservesData();

  console.log(data);
};

execute();
