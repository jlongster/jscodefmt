// https://babeljs.io/docs/en/babel-plugin-proposal-pipeline-operator
// https://github.com/js-choi/proposal-smart-pipelines

value
|> await #
|> doubleSay(#, ', ')
|> capitalize // This is a function call.
|> # + '!'
|> new User.Message(#)
|> await #
|> console.log; // This is a method call.

// (The # token isn't final; it might instead be @ or ? or %.)
