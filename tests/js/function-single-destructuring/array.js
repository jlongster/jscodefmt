function excludeFirstFiveResults([first, second, third, fourth, fifth, ...rest]) {
  return rest;
}

function excludeFirstFiveResults([first, second, third, fourth, fifth, ...rest] = DEFAULT_FIVE_RESULTS) {
  return rest;
}

function excludeFirstFiveResults([firstResult, secondResult, thirdResult, fourthResult, fifthResult, ...rest] = [1, 2, 3, 4, 5]) {
  return rest;
}

function excludeFirstFiveResults([first, second, third, fourth, fifth, ...rest]: Result[]) {
  return rest;
}

const excludeFirstFiveResults = ([first, second, third, fourth, fifth, ...rest]) => {
  return rest;
}

class A {
  excludeFirstFiveResults([first, second, third, fourth, fifth, ...restOfResults]) {
    return restOfResults;
  }
}

promise.then(([firstResult, secondResult, thirdResult, fourthResult, fifthResult, ...rest]) => {
  return rest;
});
