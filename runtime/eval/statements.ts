import { Program, VarDeclaration } from "../../frontend/ast.ts";
import Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, RuntimeVal } from "../values.ts";

export function eval_programm(program: Program, env: Enviroment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

export function eval_var_declaration(declaration: VarDeclaration, env: Enviroment): RuntimeVal {
    const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();

    return env.declareVar(declaration.identifier, value, declaration.constant);
}