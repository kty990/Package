import fetch from 'node-fetch';

const assert = (value, msg) => {
    if (!value) {
        throw new Error(msg);
    }
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
            });
    });
}

export { request }

class ParentNode {
    constructor(next, previous, nodeType) {
        this.children = [];
        this.parent = null;
        this.data = null;
        this.previous_parent_node = previous || null;
        this.next_parent_node = next || null;
        this.nodeType = nodeType || "directory";
        this.scope = 0; // default
    }

    /**
     * root.data = {
            "request": CurrentRequest,
            "url": url
        };
     */

    log() {
        let indent = "  ".repeat(this.scope); // calculate the indentation level based on the node's scope
        if (this.data !== null) {
            console.log(indent + "- " + this.data["url"]); // log the current node's data
        }
        for (let child of this.children) {
            child.log(); // recursively log the child nodes
        }
    }

    GetParent() {
        if (this.previous_parent_node) {
            return this.previous_parent_node.GetParent();
        }
        return this;
    }

    AddChildren(parentNodeChain) {
        // FINISH THIS
        let x = parentNodeChain.GetParent();
        if (x.scope == this.scope) {
            if (x.parent) {
                x.parent.children.push(parentNodeChain);
                let tmp = this.next_parent_node;
                while (tmp != null) {
                    tmp = this.next_parent_node;
                }
                tmp.next_parent_node = x;
                x.previous_parent_node = tmp;
            }
        }
    }
}

export { ParentNode }

const FROZEN_ERROR = new Error("Unable to complete process. Scraper is in use and is therefore frozen.");
class Scraper {
    constructor() {
        this.urls = [];

    }

    ConvertLink(currentUrl, link) {
        let newLink = currentUrl.replace(":/", "").split("/");
        let ss = link.replace(":/", "").split("/"); // splitstring
        console.log(ss);

        // [ '..', 'main', 'signup' ] ======= POP FROM SS > add 'main' > add 'signup' > return

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

    NextLink(str, i, currentUrl) {
        let open = str.indexOf("<a", (i || 0));
        let close = str.indexOf("</a>", (open || 0) + 6);

        if (open != -1 && close != -1) {
            let x_open = str.indexOf("href=\"", open) + 6;
            let x_close = str.indexOf("\"", x_open);
            let link = this.ConvertLink(currentUrl, str.substring(x_open, x_close));

            if (link == null) return null;

            if (this.urls.includes(link)) {
                return null;
            }
            console.log(`New Link: ${link}`);
            if (link.indexOf("https/") != -1 || link.indexOf("http/")) {
                link = link.split("/");
                let tmp = link.splice(0, 1);
                link.unshift(`${tmp}:/`);
                link = link.join("/");
            }
            return [link, close];
        }
        return null;
    }

    GetLinks(ReqResult, currentUrl) {
        let links = [];
        let link = this.NextLink(ReqResult, 0, currentUrl);
        while (link !== null) {
            links.push(link);
            link = this.NextLink(ReqResult, link[1], currentUrl)
        }
        return links;
    }

    /**
     * 
     * @param {string} url 
     * @returns Request body
     */
    async debug(url) {
        if (this.frozen) throw FROZEN_ERROR;
        this.frozen = true;
        let result = await request(url);
        this.frozen = false;
        return result;
    }

    /**
     * 
     * @param {*} url 
     * @param {int | null} iteration
     * @returns ParentNode
     * 
     * TODO:
     *     - Send iteration to GetLinks to help with assigning children
     *         - Done by sending through run and incrementing
     */
    async run(url, iteration) {
        if (this.frozen && (iteration == 1 || iteration == null)) throw FROZEN_ERROR;
        console.log(`NEW RUN: ${url}\t${iteration}`);
        this.frozen = true;
        this.urls = [];
        let root = new ParentNode(null, null);
        root.scope = (iteration || 1);
        let CurrentRequest;
        try {
            CurrentRequest = await request(url);
        } catch (err) {
            console.error(err);
            return root;
        }
        root.data = {
            "request": CurrentRequest,
            "url": url
        };
        this.urls.push(url);
        let links = this.GetLinks(CurrentRequest, url);
        console.log(links);
        for (let x = 0; x < links.length; x++) {
            console.log(`ATTEMPTING NEW RUN: ${links[x]}`);
            let z = await this.run(links[x][0], (iteration || 2));
            root.AddChildren(z);
            // If parent node, set in children of higher scope
        }
        this.frozen = false;
        console.log(this.urls);
        return root;
    }
}

export { Scraper }