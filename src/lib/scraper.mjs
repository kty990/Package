import fetch from 'node-fetch';
import { Stack } from './datatypes.mjs';

const assert = (value, msg) => {
    if (!value) {
        throw new Error(msg);
    }
}

function containsValidHTMLTag(str) {
    const regex = /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/;
    return regex.test(str);
}

const request = (url) => {
    assert(typeof url == "string", "Can't request a non-string object");
    return new Promise((resolve, reject) => {
        fetch(url).then(res => {
            resolve(res.text())
        })
            .catch(err => {
                console.error(err);
                console.debug(`URL: ${url}`);
                resolve(null);
            });
    });
}

export { request }

class Webpage {
    constructor(url = "") {
        this.url = url;
        this.LoadTags();
    }

    async LoadTags() {
        let splitBody = await request(this.url);
        let trackingStack = new Stack();
        if (splitBody) {
            splitBody = splitBody.split("<");
        } else {
            this.tags = [];
            return;
        }
        let tmp = [];
        for (let x = 0; x < splitBody.length; x++) {
            let t = splitBody[x].split(">");
            console.log(t); // TEST WITH kutcher.ca first
        }
        this.tags = tmp;
    }
}

export { Webpage }

const FROZEN_ERROR = new Error("Unable to complete process. Scraper is in use and is therefore frozen.");
class Scraper {
    constructor() {
        this.urls = [];
        this.frozen = false;
    }

    ConvertLink(currentUrl, link) {
        let newLink = currentUrl.replace(":/", "").split("/");
        const ss = link.replace(":/", "").split("/"); // splitstring

        for (let x = 0; x < ss.length; x++) {
            switch (ss[x]) {
                case '..':
                    newLink.splice(newLink.length - 2, 2);
                    continue;
                default:
                    newLink.push(ss[x]);
            }
        }
        try {
            newLink = newLink.join("/");
        } catch (err) { }
        return newLink || null;
    }

    /**
     * THE NEW PURPOSE OF THIS IS TO GET ALL THE TAGS FOR A WEBPAGE, AND GET ALL THE WEBPAGES OF A PARTICULAR WEBSITE
     */
}

export { Scraper }