function foo(str:string, i:number):string {
  return str;
}
var bar: (str:number, i:number)=> string = foo;

var qux = function(str:string, i:number):number { return foo(str,i); }

var obj: {str:string; i:number; j:boolean} = {str: "...", i: "...", k: false};

var arr: Array<number> = [1,2,"..."];

// array sugar
var array: number[] = [1,2,"..."];

var matrix: number[][] = [[1,2],[3,4]];
var matrix_parens: (number[])[] = matrix;

var nullable_array: ?number[] = null;
var nullable_array_parens: ?(number[]) = nullable_array;

var array_of_nullable: (?number)[] = [null, 3];

var array_of_tuple: [number, string][] = [[0, "foo"], [1, "bar"]];
var array_of_tuple_parens: ([number, string])[] = array_of_tuple;

type ObjType = { 'bar-foo': string; 'foo-bar': number; };
var test_obj: ObjType = { 'bar-foo': '23' };

// param type annos are strict UBs like var type annos
function param_anno(n:number):void {
  n = "hey"; // error
}

// another error on param UB, more typical of www (mis)use-cases
// this one cribbed from API.atlas.js
function param_anno2(
    batchRequests: Array<{method: string; path: string; params: ?Object}>,
  ): void {

    // error below, since we're assigning elements to batchRequests
    // which lack a path property.
    // just assign result to new var instead of reassigning to param.

    // Transform the requests to the format the Graph API expects.
    batchRequests = batchRequests.map((request) => {
      return {
        method: request.method,
        params: request.params,
        relative_url: request.path,
      };
    });
    // ...
  }

var toz : null = 3;

var zer : null = null;

function foobar(n : ?number) : number | null | void { return n; }
function barfoo(n : number | null | void) : ?number { return n; }
