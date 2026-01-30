import "./config/env.js"; // MUST be first
import { app } from "./app.js";
import startCronJobs from "./src/utils/cronJobs.js";
import {startWorker} from "./src/utils/startQueueWorker.js"
const port = process.env.PORT || 5000;
app.listen(port, () => {
  startCronJobs();
  startWorker();
  console.log(`Server running on port ${port}`);
});
