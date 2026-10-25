import { runPriceUpdate } from "../lib/price-update";

runPriceUpdate()
  .then((report) => {
    process.stdout.write(report.summary);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
