import { SITE } from "../site.config";

const expected = "https://comparadormascostas.vercel.app";
if (SITE.url !== expected) {
  console.error(SITE.url);
  process.exit(1);
}
console.log(SITE.url);
