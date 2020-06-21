/***
 * unions with embedded intersections
 * @flow
 */

type t1 = {
    p1 : number
};

type t2 = {
    p2: number
}

type t3 = {
    p3 : number
}

type intersected = t1 & t2;
type union = intersected | t3;
type union2 = t3 | intersected;

const u1 : union = {
    p3 : 3
};

const u2 : union = {
    p1 : 1,
    p2 : 2
};

const u3 : union2 = {
    p1 : 1,
    p2 : 2
};
