const fetch = require('node-fetch');

const request = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url).then(res => {
            resolve(res.text())
        });
    });
}

class ParentNode {
    constructor(next, previous) {
        this.children = [];
        this.parent = null;
        this.previous_parent_node = previous || null;
        this.next_parent_node = next || null;
        this.nodeType = nodeType;
        this.scope = 0; // default
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

const FROZEN_ERROR = new Error("Unable to complete process. Scraper is in use and is therefore frozen.");
class Scraper {
    constructor() {
        this.urls = [];
        const NextLink = (str, i) => {
            let open = str.indexOf("<a", (i || 0));
            let close = str.indexOf("</a>", (open || 0));

            if (open != -1 && close != -1) {
                let x_open = str.indexOf("href=\"", open);
                let x_close = str.indexOf("\"", x_open);
                let link = str.substring(x_open, x_close);
                if (this.urls.includes(link)) {
                    return null;
                }
                return [link, close];
            }
            return null;
        }

        const GetLinks = (ReqResult) => {
            let links = [];
            let link = NextLink(ReqResult, 0);
            while (link !== null) {
                links.push(link);
                link = NextLink(ReqResult, link[1])
            }
            return links;
        }
        this.GetLinks = GetLinks;
        this.NextLink = NextLink;
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
        this.frozen = true;
        this.urls = [];
        let root = new ParentNode(null, null);
        root.scope = (iteration || 1);
        let CurrentRequest = await request(url);
        root.data = CurrentRequest;
        let links = GetLinks(CurrentRequest);
        for (let x = 0; x < links.length; x++) {
            let z = await this.run(links[x].url, (iteration || 2));
            root.AddChildren(z);
            // If parent node, set in children of higher scope
        }
        this.frozen = false;
        return root
    }
}

/**
 * ParentNode.GetLowestChild() <-- May not be required
 * ParentNode.AddChlidren(<ParentNode>) <-- Takes a ParentNode (potentially a parent node list) and iterates through self. If iteration is same level, add as next parent node. If it is 1 less, add as child. 
 */