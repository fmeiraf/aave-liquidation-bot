import { getAllUsers } from "../graphql/queries";
import { performance } from "perf_hooks";

async function execute_query() {
  let allUsers: Array<any> = [];

  const t0 = performance.now();
  let keepRunning = true;
  let lastID = "";
  while (keepRunning) {
    console.log(`We are at pagination..X`);
    let new_content = await getAllUsers(lastID);

    if (new_content === "Done") {
      break;
    }
    lastID = new_content[new_content.length - 1]["id"];
    allUsers = allUsers.concat(new_content);
  }

  console.log(allUsers.length);
  console.log(allUsers);

  const t1 = performance.now();

  console.log(`Query execution time (seconds) : ${(t1 - t0) / 1000}`);
}

execute_query();
