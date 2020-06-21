/**
 * @flow
 */
import * as t from './jsAst';

const b = t.builders;

import type {
        TypedNode
} from './ast';

function getBinaryOp(op: 'plus' | 'minus' | 'divide' | 'multiply') : '+' | '-' | '*' | '/' {
  switch (op) {
  case 'plus':
    return '+';
  case 'minus':
    return '-';
  case 'divide':
    return '/';
  case 'multiply':
    return '*';
  default:
    throw new Error('Invalid binary operator: ' + op);
  }
}

export function emitExpression(node: TypedNode) : t.Expression {
  switch (node.exprNodeType) {
  case 'string_literal': // FALLTHROUGH
  case 'number':
    return b.literal(node.value);
  case 'variable':
    return b.memberExpression(
      b.identifier('vars'),
      b.identifier(node.name),
      false
    );
  case 'binary_op': {
    const lhs = emitExpression(node.lhs);
    const rhs = emitExpression(node.rhs);

    const op = getBinaryOp(node.binaryOp);
    return b.binaryExpression(op, lhs, rhs);
  }
  case 'unary_minus': {
    const operand = emitExpression(node.op);
    return b.unaryExpression('-', operand, true);
  }
  case 'function_invocation': {
    const callee = b.memberExpression(
      b.identifier('fns'),
      b.identifier(node.name),
      false
    );

    const args = node.parameters.map(
      (n) => emitExpression(n)
    );

    return b.callExpression(callee, args);
  }
  default:
    throw new Error('Unknown expression type: ' + node.type);
  }
}
