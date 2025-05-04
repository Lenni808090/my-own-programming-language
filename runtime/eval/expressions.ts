import { BinaryExpr, Identifier } from "../../frontend/ast.ts";
import Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, NumberVal, RuntimeVal } from "../values.ts";

export function eval_binary_expression(binop: BinaryExpr, env: Enviroment): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if (lhs.type == "number" && rhs.type == "number") {
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator
    );
  }

  return MK_NULL();
}


function eval_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string
): NumberVal {
  let result: number;

  if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    result = lhs.value / rhs.value;
  } else {
    result = lhs.value % rhs.value;
  }

  return { value: result, type: "number" };
}


export function eval_identifier(ident: Identifier, env: Enviroment): RuntimeVal{
    const val = env.lookUpVAr(ident.symbol);
    return val
}