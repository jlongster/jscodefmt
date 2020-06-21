/**
 * @flow
 */

export type InferredType =
  | 'unknown'
  | 'gender'
  | 'enum'
  | 'number-or-string'
  | 'number'
  | 'string'
  | 'error'
;

export type Pos = {
  firstLine: number,
  firstColumn: number,
  lastLine: number,
  lastColumn: number,
};

export type TypedBinaryOpNode = {
  exprNodeType: 'binary_op',
  binaryOp: 'plus' | 'multiply' | 'divide' | 'minus',
  lhs: TypedNode,
  rhs: TypedNode,
  pos: Pos,
  exprType: InferredType,
  typed: true,
}

export type TypedUnaryMinusNode = {
  exprNodeType: 'unary_minus',
  op: TypedNode,
  pos: Pos,
  exprType: InferredType,
  typed: true,
}

export type TypedNumberNode = {
  exprNodeType: 'number',
  value: number,
  pos: Pos,
  exprType: 'number',
  typed: true,
}

export type TypedStringLiteralNode = {
  exprNodeType: 'string_literal',
  value: string,
  pos: Pos,
  exprType: 'string',
  typed: true,
}

export type TypedVariableNode = {
  exprNodeType: 'variable',
  name: string,
  pos: Pos,
  exprType: InferredType,
  typed: true,
};

export type TypedFunctionInvocationNode = {
  exprNodeType: 'function_invocation',
  name: string,
  parameters: TypedNode[],
  pos: Pos,
  exprType: 'error' | 'string',
  typed: true,
}

export type TypedNode =
  | TypedBinaryOpNode
  | TypedUnaryMinusNode
  | TypedNumberNode
  | TypedStringLiteralNode
  | TypedVariableNode
  | TypedFunctionInvocationNode
;
