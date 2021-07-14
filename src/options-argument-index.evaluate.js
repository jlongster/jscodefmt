"use strict";

// Advanced math expression evaluate algorithm invented by @prettier in 2021
// Steps:
//  1. Convert math expression to `boolean`
//  2. Convert `boolean` result back to `number`
//  3. Get the result of the math expression
const evaluate = (expression) => Number(Boolean(expression));

// Usually `options` is the 2nd argument
module.exports = evaluate("💯✖💯➕1️⃣➖💯✖💯");
