import {  RuntimeVal, NumberVal} from "./values.ts";
import { BinaryExpr, NumericLiteral, Stmt, Program, Identifier, VarDeclaration } from "../frontend/ast.ts";
import Enviroment from "./enviroment.ts";
import { eval_programm, eval_var_declaration } from "./eval/statements.ts";
import { eval_binary_expression, eval_identifier } from "./eval/expressions.ts";


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
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    default:
      console.error(
        "this astnode has not been set up for interpretation",
        astNode
      );
      Deno.exit(1);
  }
}
