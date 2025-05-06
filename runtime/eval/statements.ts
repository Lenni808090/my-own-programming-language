import {
  FunctionDeclaration,
  IfStatement,
  Program,
  VarDeclaration,
  ReturnStatement
} from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, FunctionValue, MK_NULL, RuntimeVal } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
    if (statement.kind === "ReturnStatement") {
      return lastEvaluated;
    }
  }
  return MK_NULL(); 
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();

  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_function_declaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  // Create new function scope
  const fn = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue;

  return env.declareVar(declaration.name, fn, true);
}

export function eval_if_statement(
  statement: IfStatement,
  env: Environment
): RuntimeVal {
  const condition = evaluate(statement.condition, env);

  if (condition.type === "boolean" && (condition as BooleanVal).value) {
    let result: RuntimeVal = MK_NULL();

    for (const stmt of statement.thenBranch) {
		const evaluated = evaluate(stmt, env);
		if (stmt.kind === "ReturnStatement") {
			result = evaluated;
			break;
		}
    }

    return result;
  } else if (statement.elseIfBranches && statement.elseIfBranches.length > 0) {

    let result: RuntimeVal = MK_NULL();

    for (const elseifBranch of statement.elseIfBranches) {
      const condition = evaluate(elseifBranch.condition, env);
      if (condition.type == "boolean" && (condition as BooleanVal).value) {

        for (const stmt of elseifBranch.body) {
			const evaluated = evaluate(stmt, env);
			if (stmt.kind === "ReturnStatement") {
			  result = evaluated;
			  break;
			}
        }

        break
      }
    }

    return result;
  }else if(statement.elseBranch && statement.elseBranch.length > 0){
	let result: RuntimeVal = MK_NULL();

    for (const stmt of statement.thenBranch) {
		const evaluated = evaluate(stmt, env);
		if (stmt.kind === "ReturnStatement") {
		  result = evaluated;
		  break;
		}
    }

    return result;
  }

  return MK_NULL();
}



export function eval_return_statement(returnStmt: ReturnStatement, env:Environment){
	const returnValue = returnStmt.value ? evaluate(returnStmt.value, env) : MK_NULL();
	return returnValue;
}
