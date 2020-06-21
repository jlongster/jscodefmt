/**
 * @flow
 */
export type Comment = {
  loc: ?SourceLocation,
  value: string,
  leading: boolean,
  trailing: boolean,
};

export type SourceLocation = {
  start: SourcePosition,
  end: SourcePosition,
  source: ?string,
};

export type SourcePosition = {
  line: number,
  column: number,
};

export type File = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'File',
  program: Program,
}

export type Program = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'Program',
  body: Statement[],
}

export type BinaryOperator =
  |'=='
  | '!='
  | '==='
  | '!=='
  | '<'
  | '<='
  | '>'
  | '>='
  | '<<'
  | '>>'
  | '>>>'
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '&' // TODO Missing from the Parser API.
  | '|'
  | '^'
  | 'in'
  | 'instanceof'
  | '..'
;

export type UnaryOperator =
  | '-'
  | '+'
  | '!'
  | '~'
  | 'typeof'
  | 'void'
  | 'delete'
;

export type AssignmentOperator =
  | '='
  | '+='
  | '-='
  | '*='
  | '/='
  | '%='
  | '<<='
  | '>>='
  | '>>>='
  | '|='
  | '^='
  | '&='
;

export type UpdateOperator =
  | '++'
  | '--'
;

export type LogicalOperator =
  | '&&'
  | '||'
;

export type Node =
  | EmptyStatement
  | BlockStatement
  | ExpressionStatement
  | IfStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | ThrowStatement
  | WhileStatement
  | ForStatement
  | ForInStatement
  | TryStatement
  | CatchClause
  | Identifier
  | Literal
  | ThisExpression
  | ArrayExpression
  | ObjectExpreession
  | Property
  | FunctionExpression
  | BinaryExpression
  | UnaryExpression
  | AssignmentExpression
  | UpdateExpression
  | LogicalExpression
  | ConditionalExpression
  | NewExpression
  | CallExpression
  | MemberExpression
  | VariableDeclaration
  | FunctionDeclaration
  | VariableDeclarator
;

export type Statement =
  | BlockStatement
  | EmptyStatement
  | ExpressionStatement
  | IfStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | ThrowStatement
  | WhileStatement
  | ForStatement
  | ForInStatement
  | TryStatement
  | Declaration
;

export type EmptyStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'EmptyStatement',
}

export type BlockStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'BlockStatement',
  body: Statement[],
}

export type ExpressionStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ExpressionStatement',
  expression: Expression,
}

export type IfStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'IfStatement',
  test: Expression,
  consequent: Statement,
  alternate: ?Statement,
}

export type BreakStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'BreakStatement',
  label: ?Identifier,
}

export type ContinueStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ContinueStatement',
  label: ?Identifier,
}

export type ReturnStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ReturnStatement',
  argument: ?Expression,
}

export type ThrowStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ThrowStatement',
  argument: ?Expression,
}

export type WhileStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'WhileStatement',
  test: Expression,
  body: Statement,
}

export type ForStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ForStatement',
  init: ?(VariableDeclaration | Expression),
  test: ?Expression,
  update: ?Expression,
  body: Statement,
}

export type ForInStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ForInStatement',
  left: VariableDeclaration | Expression,
  right: Expression,
  body: Statement,
}

export type TryStatement = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'TryStatement',
  block: BlockStatement,
  handler: ?CatchClause,
  handlers: CatchClause[],
  finalizer: ?BlockStatement,
};

export type CatchClause = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'CatchClause',
  param: Pattern,
  guard: ?Expression,
  body: BlockStatement,
};

export type Expression =
  | Identifier
  | ThisExpression
  | Literal
  | FunctionExpression
  | BinaryExpression
  | UnaryExpression
  | AssignmentExpression
  | UpdateExpression
  | LogicalExpression
  | ConditionalExpression
  | NewExpression
  | CallExpression
  | MemberExpression
  | ArrayExpression
  | ObjectExpreession
;

export type Identifier = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'Identifier',
  name: string,
}

export type Literal = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'Literal',
  value: ?(string | boolean | number | RegExp),
  regex: ?{ pattern: string, flags: string },
}

export type ThisExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ThisExpression',
}

export type ArrayExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ArrayExpression',
  elements: Expression[],
}

export type ObjectExpreession = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ObjectExpression',
  properties: Property[],
}

export type Property = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'Property',
  kind: 'init' | 'get' | 'set',
  key: Literal | Identifier,
  value: Expression,
};

export type FunctionExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'FunctionExpression',
  id: ?Identifier,
  params: Pattern[],
  body: BlockStatement,
}

export type BinaryExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'BinaryExpression',
  operator: BinaryOperator,
  left: Expression,
  right: Expression,
}

export type UnaryExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'UnaryExpression',
  operator: UnaryOperator,
  argument: Expression,
  prefix: boolean,
};

export type AssignmentExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'AssignmentExpression',
  operator: AssignmentOperator,
  left: Pattern,
  right: Expression,
};

export type UpdateExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'UpdateExpression',
  operator: UpdateOperator,
  argument: Expression,
  prefix: boolean,
};

export type LogicalExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'LogicalExpression',
  operator: LogicalOperator,
  left: Expression,
  right: Expression,
};

export type ConditionalExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'ConditionalExpression',
  test: Expression,
  consequent: Expression,
  alternate: Expression,
};

export type NewExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'NewExpression',
  callee: Expression,
  arguments: Expression[],
};

export type CallExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'CallExpression',
  callee: Expression,
  arguments: Expression[],
};

export type MemberExpression = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'MemberExpression',
  object: Expression,
  property: Identifier | Expression,
  computed: bool,
}
// ast-types exports all expressions as patterns.
// That seems not like it was intended.
export type Pattern =
  | Identifier
;

export type Declaration =
  | VariableDeclaration
  | FunctionDeclaration
;

export type VariableDeclaration = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'VariableDeclaration',
  kind: 'var' | 'let' | 'const',
  declarations: VariableDeclarator[],
}

export type FunctionDeclaration = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'FunctionDeclaration',
  id: Identifier,
  body: BlockStatement,
  params: Pattern[],
}

export type VariableDeclarator = {
  source: ?string,
  start: SourcePosition,
  end: SourcePosition,
  comments: ?Array<Comment>,
  type: 'VariableDeclarator',
  id: Pattern,
  init: ?Expression,
}

const a : any = null;

export const builders : {
  emptyStatement() : EmptyStatement,
  blockStatement(
    body: Statement[]
  ) : BlockStatement,
  expressionStatement(
    expression: Expression
  ) : ExpressionStatement,
  ifStatement(
    test: Expression,
    consequent: Statement,
    alternate?: Statement
  ) : IfStatement,
  breakStatement(
    label?: Identifier
  ) : BreakStatement,
  continueStatement(
    label?: Identifier
  ) : ContinueStatement,
  returnStatement(
    argument: ?Expression
  ) : ReturnStatement,
  throwStatement(
    argument: ?Expression
  ) : ThrowStatement,
  whileStatement(
    test: Expression,
    body: Statement
  ) : WhileStatement,
  forStatement(
    init: ?(VariableDeclaration | Expression),
    test: ?Expression,
    update: ?Expression,
    body: Statement
  ) : ForStatement,
  forInStatement(
    left: VariableDeclaration | Expression,
    right: Expression,
    body: Statement
  ) : ForInStatement,
  tryStatement(
    block: BlockStatement,
    handler: ?CatchClause,
    handlers: CatchClause[],
    finalizer?: BlockStatement
  ) : TryStatement,
  catchClause(
    param: Pattern,
    guard: ?Expression,
    body: BlockStatement
  ) : CatchClause,
  identifier(
    name: string
  ) : Identifier,
  literal(
    value: ?(string | boolean | number | RegExp),
    regex?: { pattern: string, flags: string }
  ) : Literal,
  thisExpression() : ThisExpression,
  arrayExpression(
    elements: Expression[]
  ) : ArrayExpression,
  objectExpreession(
    properties: Property[]
  ) : ObjectExpreession,
  property(
    kind: 'init' | 'get' | 'set',
    key: Literal | Identifier,
    value: Expression
  ) : Property,
  functionExpression(
    id: ?Identifier,
    params: Pattern[],
    body: BlockStatement
  ) : FunctionExpression,
  binaryExpression(
    operator: BinaryOperator,
    left: Expression,
    right: Expression
  ) : BinaryExpression,
  unaryExpression(
    operator: UnaryOperator,
    argument: Expression,
    prefix: boolean
  ) : UnaryExpression,
  assignmentExpression(
    operator: AssignmentOperator,
    left: Pattern,
    right: Expression
  ) : AssignmentExpression,
  updateExpression(
    operator: UpdateOperator,
    argument: Expression,
    prefix: boolean
  ) : UpdateExpression,
  logicalExpression(
    operator: LogicalOperator,
    left: Expression,
    right: Expression
  ) : LogicalExpression,
  conditionalExpression(
    test: Expression,
    consequent: Expression,
    alternate: Expression
  ) : ConditionalExpression,
  newExpression(
    callee: Expression,
    arguments: Expression[]
  ) : NewExpression,
  callExpression(
    callee: Expression,
    arguments: Expression[]
  ) : CallExpression,
  memberExpression(
    object: Expression,
    property: Identifier | Expression,
    computed: bool
  ) : MemberExpression,
  variableDeclaration(
    kind: 'var' | 'let' | 'const',
    declarations: VariableDeclarator[]
  ) : VariableDeclaration,
  functionDeclaration(
    id: Identifier,
    body: BlockStatement,
    params: Pattern[]
  ) : FunctionDeclaration,
  variableDeclarator(
    id: Pattern,
    init?: Expression
  ) : VariableDeclarator,
} = a;
