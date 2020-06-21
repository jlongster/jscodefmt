class C { }

class D {
    content: string|C;
    copyContent(content: C): string|C {
        this.content = content;
        return this.content;
    }
}
