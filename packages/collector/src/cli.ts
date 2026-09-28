import { startCollector, stopCollector } from "./index";

startCollector().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

process.once("SIGINT", () => {
  stopCollector();
  process.exit(0);
});

process.once("SIGTERM", () => {
  stopCollector();
  process.exit(0);
});
