import { getAllUsers } from "../graphql/queries";
import { performance } from "perf_hooks";

async function execute_query() {
  let n_: number = 100;
  let pag_: number = 0;
  let allUsers: Array<any> = [];

  const t0 = performance.now();
  while (pag_ <= 50000) {
    console.log(`We are at pagination ${pag_}`);
    let new_content = await getAllUsers(n_, pag_);

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
