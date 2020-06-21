// $FlowFixMe
var test1: string = 123; // This error should be suppressed

// $FlowIssue
var test2: string = 123; // This error should be suppressed

function getNum() {
  return 123;
}

// $FlowFixMe This was the second loc in the error
var test3: string = getNum(); // This error should be suppressed

// $FlowFixMe Error unused suppression

var test4: string = 123; // This error is NOT suppressed

                         // $FlowFixMe Indentation shouldn't matter
var test5: string = 123; // This error should be suppressed

/*
 * $FlowNewLine
 */
var test6: string = 123;
