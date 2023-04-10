import fetch from 'node-fetch';
import { Stack } from './datatypes.mjs';
import { tags } from './html.mjs';

const assert = (value, msg) => {
    if (!value) {
        throw new Error(msg);
    }
}

// function containsValidHTMLTag(str) {
//     const regex = /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/;
//     return regex.test(str);
// }

function containsValidHTMLTag(str) {
    return str in tags;
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

class Tag {
    /**
     * 
     * @param {*} type 
     * @param {*} id 
     * @param {*} classList 
     * @param {*} style 
     * @param {*} scope
     * 
     * Currently needs to be modified to recognize HTMLElement.textContent 
     */
    constructor(type = null, id = null, classList = null, style = null, scope = -1) {
        this.type = type;
        this.id = id;
        this.classList = classList;
        this.style = style;
        this.scope = scope;
        this.children = [];
        this.endingTag = tags[type];
    }

    ConvertStyleToList() {
        let s = "";
        if (this.style) {
            if (typeof this.style == "object") {
                for (const [key, value] of Object.entries(this.style)) {
                    s = s + `${key}:${value}\n`
                }
            }
        }
        return s;
    }

    ConvertToString() {
        let s = `<${this.type}`;
        if (this.id) {
            s = s + ` id="${this.id}"`;
        }
        if (this.classList) {
            s = s + ` class="${this.classList.join(" ")}"`;
        }
        if (this.style) {
            s = s + ` style="${this.ConvertStyleToList()}"`;
        }
        s = s + ">"
        for (let x = 0; x < this.children.length; x++) {
            if (!(this.children[x] instanceof Tag)) {
                continue;
            }
            console.log("Adding child");
            let child = this.children[x].ConvertToString();
            s = s + child;
        }
        console.log(s);
        if (this.endingTag) {
            return `${s}</${this.type}>`;
        }
    }
}

export { Tag }

class Webpage {
    constructor(url = "") {
        this.url = url;
        this.LoadTags();
    }


    GetTagName(tagExpression) {
        if (!tagExpression) return "GENERIC TAG NAME";
        return tagExpression.split(" ")[0];
    }

    GetId(tagExpression) {
        console.log(`GetId TagExpression: ${tagExpression}`);
        let i = tagExpression.indexOf("id=\"");
        let hasId = i != -1;
        if (hasId) {
            let ending = tagExpression.indexOf("\"", i + 4);
            return tagExpression.substring(i + 4, ending);
        }
        return null;
    }

    GetClassList(tagExpression) {
        let i = tagExpression.indexOf("class=\"");
        let hasClass = i != -1;
        if (hasClass) {
            let ending = tagExpression.indexOf("\"", i + 7);
            return tagExpression.substring(i + 7, ending).split(" ");
        }
        return null;
    }

    GetStyle(tagExpression) {
        let i = tagExpression.indexOf("style=\"");
        let hasStyle = i != -1;
        if (hasStyle) {
            let ending = tagExpression.indexOf("\"", i + 7);
            return tagExpression.substring(i + 7, ending).split(" ");
        }
        return null;
    }

    // async LoadTags() {
    //     let splitBody = await request(this.url);
    //     let trackingStack = new Stack();
    //     let tagStack = [];
    //     if (!splitBody) {
    //         this.tags = [];
    //         return;
    //     }
    //     splitBody = splitBody.split("<")

    //     let tmp = [];
    //     let last = {}; // key=scope, value=tag
    //     let global_scope = 1;

    //     for (let i = 0; i < splitBody.length; i++) {
    //         let t = splitBody[i].trim();
    //         console.log(`t: ${t}`);

    //         const tagName = this.GetTagName(t); //t[0]
    //         console.log(`TAG: ${tagName}`);
    //         if (!tagName || tagName.length === 0) continue;
    //         if (containsValidHTMLTag(tagName) || containsValidHTMLTag(`${tagName.substring(1)}`)) {
    //             if (t[0].indexOf("/") === -1) {
    //                 // opening tag

    //                 const id = this.GetId(t[0]);
    //                 const classes = this.GetClassList(t[0]);
    //                 const style = this.GetStyle(t[0]);
    //                 const tag = new Tag(tagName, id, classes, style, global_scope);
    //                 console.debug(`Opening tag: ${tagName}`);
    //                 if (tags[tagName.toLowerCase()]) {
    //                     // 2 tags
    //                     trackingStack.push(tag);
    //                     global_scope++;
    //                 }
    //             } else if (!tags[tagName.toLowerCase()]) {
    //                 // solo tag
    //                 const id = this.GetId(t[0]);
    //                 const classes = this.GetClassList(t[0]);
    //                 const style = this.GetStyle(t[0]);
    //                 const tag = new Tag(tagName, id, classes, style, global_scope);
    //                 console.debug(`Solo tag: ${tagName}`);
    //                 if (global_scope === 1) {
    //                     tmp.push(tag);
    //                     tagStack.push(tag);
    //                 } else {
    //                     if (!last[global_scope]) last[global_scope] = [];
    //                     last[global_scope].push(tag);
    //                     tagStack.push(tag);
    //                 }
    //             } else {
    //                 // closing tag
    //                 global_scope--;
    //                 const tag = trackingStack.pop();

    //                 if (tag && tag.type === this.GetTagName(t[0].substring(1))) {
    //                     if (global_scope === 1) {
    //                         tmp.push(tag);
    //                         // assign children to tags with lower scope
    //                         // while (tagStack.length > 0 && tagStack[tagStack.length - 1].scope > tag.scope) {
    //                         //     const child = tmp.pop();
    //                         //     if (!last[tagStack[tagStack.length - 1].scope]) {
    //                         //         last[tagStack[tagStack.length - 1].scope] = [];
    //                         //     }
    //                         //     last[tagStack[tagStack.length - 1].scope].push(child);
    //                         //     tagStack[tagStack.length - 1].children.push(child);
    //                         // }
    //                         // tagStack.pop();
    //                         if (global_scope + 1 in last) {
    //                             for (let x = 0; x < last[global_scope + 1].length; x++) {
    //                                 tag.children.push(last[global_scope + 1].splice(0, 1)[0]);
    //                             }
    //                         }
    //                     } else {
    //                         if (!last[global_scope]) last[global_scope] = [];
    //                         last[global_scope].push(tag);
    //                         tagStack.push(tag);
    //                     }
    //                 } else {
    //                     console.error(`Unable to match opening and closing tags: ${tag.type}, ${this.GetTagName(t[0].substring(1))}`);
    //                 }
    //             }
    //         }
    //     }

    //     if (tmp.length !== 1) {
    //         for (let x = 0; x < tmp.length; x++) {
    //             console.log(tmp[x].ConvertToString());
    //         }
    //         throw new Error("Parsing error: mismatched opening and closing tags.");
    //     }

    //     // assign children to root tag
    //     if (last[1]) {
    //         for (let i = 0; i < last[1].length; i++) {
    //             this.tags.children.push(last[1][i]);
    //         }
    //     }



    //     this.tags = tmp[0];
    // }

    async LoadTags() {
        let splitBody = await request(this.url);
        let trackingStack = new Stack();
        let tagStack = [];
        if (!splitBody) {
            this.tags = [];
            return;
        }
        splitBody = splitBody.split("<");

        let tmp = [];
        let last = {}; // key=scope, value=tag
        let global_scope = 1;

        for (let i = 0; i < splitBody.length; i++) {
            let t = splitBody[i].trim();
            console.log(`t: ${t}`);

            const tagName = this.GetTagName(t); //t[0]
            console.log(`TAG: ${tagName}`);
            if (!tagName || tagName.length === 0) continue;
            if (containsValidHTMLTag(tagName) || containsValidHTMLTag(`${tagName.substring(1)}`)) {
                if (t[0].indexOf("/") === -1) {
                    // opening tag
                    const id = this.GetId(t);
                    const classes = this.GetClassList(t[0]);
                    const style = this.GetStyle(t[0]);
                    const tag = new Tag(tagName, id, classes, style, global_scope);
                    console.debug(`Opening tag: ${tagName}`);
                    if (tags[tagName.toLowerCase()]) {
                        // 2 tags
                        trackingStack.push(tag);
                        global_scope++;
                    }
                } else if (!tags[tagName.toLowerCase()]) {
                    // solo tag
                    const id = this.GetId(t);
                    const classes = this.GetClassList(t[0]);
                    const style = this.GetStyle(t[0]);
                    const tag = new Tag(tagName, id, classes, style, global_scope);
                    console.debug(`Solo tag: ${tagName}`);
                    if (global_scope === 1) {
                        tmp.push(tag);
                        tagStack.push(tag);
                    } else {
                        if (!last[global_scope]) last[global_scope] = [];
                        last[global_scope].push(tag);
                        tagStack.push(tag);
                    }
                } else {
                    // closing tag
                    if (trackingStack.top().type === tags[tagName.toLowerCase()]) {
                        console.debug(`Closing tag: ${tagName}`);
                        const t = trackingStack.pop();
                        const children = last[global_scope];
                        if (children) {
                            for (let i = 0; i < children.length; i++) {
                                if (children[i].type !== undefined) {
                                    t.children.push(children[i]);
                                }
                            }
                            delete last[global_scope];
                        }
                        if (global_scope > 1) {
                            global_scope--;
                        } else {
                            tmp.push(t);
                            tagStack.push(t);
                        }
                    }
                }
            }
        }

        while (!trackingStack.isEmpty()) {
            let t = trackingStack.pop();
            tmp.push(t);
            tagStack.push(t);
        }

        console.debug("TMP:");
        console.debug(tmp);

        this.tags = tmp;
    }


    log() {
        let output = `WEBPAGE (${this.url})\n\n`;
        for (let x = 0; x < this.tags.length; x++) {
            console.log(`typeof ${this.tags[x] instanceof Tag}`);
            let s = this.tags[x].ConvertToString();
            output = output + `${s}\n\n`
        }
        console.log(output);
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

