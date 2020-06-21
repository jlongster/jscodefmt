// All of these should be an error

module Y3 {
    public module Module {
        class A { s: string }
    }

    // Apparently this parses :P
    export private public protected static readonly abstract async enum X { }

    interface x {
        export private static readonly [x: any]: any;
    }
}

module Y4 {
    public enum Color { Blue, Red }
}

module YY3 {
    private module Module {
        class A { s: string }
    }
}

module YY4 {
    private enum Color { Blue, Red }
}

module YYY3 {
    static module Module {
        class A { s: string }
    }
}

module YYY4 {
    static enum Color { Blue, Red }
}
