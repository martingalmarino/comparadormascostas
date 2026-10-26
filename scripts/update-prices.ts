import { runPriceUpdate } from "../lib/price-update";

// Si el precio publicado sigue verificado, runPriceUpdate agrega el punto a data/historial/{slug}.json.

runPriceUpdate()
  .then((report) => {
    process.stdout.write(report.summary);
    if (report.fallo) process.exit(1);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
