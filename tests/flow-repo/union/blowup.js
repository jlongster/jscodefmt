// @flow

export type Select = {
  expression: ArithmeticExpression;
  alias: ?string;
}

export class Query {
  _select: Array<Select> = [];

  select(expr: ArithmeticExpression): this {
    this._select.push ({
      expression: expr,
      alias: '',
    });
    return this;
  }
}

export class BinaryExpression<T: ArithmeticExpression, U: ArithmeticExpression> {
}

export type ArithmeticExpression = PlusOp | MinusOp | MulOp | DivOp | ModOp;

export class PlusOp extends BinaryExpression<ArithmeticExpression, ArithmeticExpression> {

}

export class MinusOp extends BinaryExpression<ArithmeticExpression, ArithmeticExpression, ArithmeticExpression, ArithmeticExpression> {

}

export class MulOp extends BinaryExpression<ArithmeticExpression, ArithmeticExpression, ArithmeticExpression, ArithmeticExpression> {

}

export class DivOp extends BinaryExpression<ArithmeticExpression, ArithmeticExpression, ArithmeticExpression, ArithmeticExpression> {

}

export class ModOp extends BinaryExpression<ArithmeticExpression, ArithmeticExpression, ArithmeticExpression, ArithmeticExpression> {

}
