class Tag {
    constructor() {
        var a1: Array<Tag|string> = [];
        var a2: Array<Tag|string> = a1;
    }
}

type Node = Tag_ | string;
class Tag_ {
    constructor() {
        var a1: Array<Node> = [new Tag_];
        var a2: Array<Node> = a1;
    }
}
