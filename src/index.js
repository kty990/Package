const fetch = require('node-fetch');

const request = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url).then(res => {
            resolve(res.text())
        });
    });
}

const GetLinks = () => {

}

class ParentNode {
    constructor(next, previous) {
        this.children = [];
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
}

class ChildNode {
    /**
     * 
     * @param {*} parent : The parent of this node
     *  
     * This node type should only be used at the bottom of that branch in the tree
     */
    constructor(parent) {
        this.parent = parent || null;
        this.nodeType = nodeType;
    }
}


class Scraper {
    constructor() { }

    /**
     * 
     * @param {string} url 
     * @returns Request body
     */
    async debug(url) {
        return await request(url);
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
        let root = new ParentNode(null,null);
        root.scope = (iteration || 1);
        let CurrentRequest = await request(url);
        root.data = CurrentRequest;
        let links = GetLinks(CurrentRequest);
        for (let x = 0; x < links.length; x++) {
            let z = await this.run(links[x].url, (iteration || 2));
            let parent = z.GetParent();
            // Get the current scope level
            // If parent node, set in children of higher scope
        }
        return root
    }
}