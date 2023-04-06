import { Scraper, ParentNode, request } from "./lib/scraper.mjs";

async function test() {
    let s = new Scraper();
    let res = await s.debug("https://github.com/kty990/kty990.github.io");
    console.log(`Result: ${res}`);
}

test()