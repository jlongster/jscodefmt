/**
 * @flow
 */
function foo(
): number {
    switch ('foo') {
    case 'foo':
        return 1;
    }
    return 2;
}

function bar() {
    switch ('bar') {
    case 'bar':
        break;
    default:
        break;
    }
}

function qux(b) {
    var x = b? 0: "";
    switch('qux') {
    case '':
        x = 0;
    case 'qux':
        x = x*x;
    }
}
