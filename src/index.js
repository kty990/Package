import { Scraper, ParentNode, request } from "./lib/scraper.mjs";

async function test() {
    let s = new Scraper();
    let res = await s.run("https://www.kutcher.ca/main/home");
    console.log(res.data["request"]);
    res.log();
}

test()