import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.monthly(
  "resetFixedExpenses",
  {
    day: 1,
    hourUTC: 0,
    minuteUTC: 0,
  },
  api.fixedExpenses.resetFixedExpensesStatus
);

export default crons;

