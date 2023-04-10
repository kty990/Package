class Node {
    constructor(data = "<empty node>", next = null, prev = null) {
        this.data = data;
        this.next = next;
        this.prev = prev;
    }
}

const EMPTY_STACK_ERROR = new Error("Error: Unable to perform requested action on empty stack.");
class Stack {
    constructor() {
        this.root = null;
    }

    push(value) {
        let n = new Node(value, this.root, null);
        if (this.root) {
            this.root.prev = n;
        }
        this.root = n;
    }

    pop() {
        if (!this.root) throw EMPTY_STACK_ERROR;
        let tmp = this.root;
        this.root = this.root.next;
        return tmp.data;
    }

    log() {
        if (!this.root) throw EMPTY_STACK_ERROR;
        let tmp = this.root;
        let s = `${tmp.data} `;
        while (tmp.next) {
            if (tmp.data) {
                s = s + `> ${tmp.data.ConvertToString()} `;
            }
            tmp = tmp.next;
        }
        console.log(s);
    }

    isEmpty() {
        return this.root == null;
    }
}

export { Stack }