import { request, Webpage, Scraper } from "./lib/scraper.mjs";

async function test() {
    let w = new Webpage("https://www.kutcher.ca/main/home");
    console.log("5 second countdown starts now! ====================================")
    setTimeout(() => {
        w.log();
        console.log("Code should have been exectued.. ====================================")
    }, 5000);
}

test()