class A {

    b: string;

    c(d = this.b) { // ok - can use `this` in function default parameter values

    }

    e() {
        return this.b;
    }

    f(g = this.e()) { // ok - can use `this` in function default parameter values

    }

    h(i: number = this.b) { // error

    }

}
