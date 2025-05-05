import {
	FunctionDeclaration,
	IfStatement,
	Program,
	VarDeclaration,
} from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, FunctionValue, MK_NULL, RuntimeVal } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
	let lastEvaluated: RuntimeVal = MK_NULL();
	for (const statement of program.body) {
		lastEvaluated = evaluate(statement, env);
	}
	return lastEvaluated;
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

export function eval_if_statement(statement: IfStatement, env: Environment): RuntimeVal{
	const condition = evaluate(statement.condition, env);
	
	if(condition.type === "boolean" && (condition as BooleanVal).value){

		let result: RuntimeVal = MK_NULL();

		for (const stmt of statement.thenBranch) {
			result = evaluate(stmt, env);
		}

		return result;

	}else if(statement.elseBranch){
		let result: RuntimeVal = MK_NULL();

		for(const stmt of statement.elseBranch){
			result = evaluate(stmt, env);
		}

		return result;
		
	}

	return MK_NULL();
}
