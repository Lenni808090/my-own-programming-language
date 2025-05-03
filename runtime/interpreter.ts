import {  RuntimeVal, NumberVal, MK_NULL } from "./values.ts";
import { BinaryExpr, NumericLiteral, Stmt, Program, Identifier } from "../frontend/ast.ts";
import Enviroment from "./enviroment.ts";

function eval_binary_expression(binop: BinaryExpr, env: Enviroment): RuntimeVal {
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

function eval_programm(program: Program, env: Enviroment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
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


function eval_identifier(ident: Identifier, env: Enviroment): RuntimeVal{
    const val = env.lookUpVAr(ident.symbol);
    return val
}

export function evaluate(astNode: Stmt, env: Enviroment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "Identifier":
        return eval_identifier(astNode as Identifier , env)
    case "BinaryExpr":
      return eval_binary_expression(astNode as BinaryExpr, env);
    case "Program":
      return eval_programm(astNode as Program, env );
    default:
      console.error(
        "this astnode has not been set up for interpretation",
        astNode
      );
      Deno.exit(1);
  }
}
