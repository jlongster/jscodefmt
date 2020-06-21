declare class Myclass {
    myfun(myarray: Array<Function | string>): any;
}
declare var myclass: Myclass;

myclass.myfun(["1", "2", "3", "4", "5", "6", function (ar) {}])
myclass.myfun(["1", "2", "3", "4", "5", "6", "7", function (ar) {}])
