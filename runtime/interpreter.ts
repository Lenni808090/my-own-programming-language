import { NumberVal, RuntimeVal, StringVal } from "./values.ts";
import {
ArrayLiteral,
	AssignmentExpr,
	BinaryExpr,
	CallExpr,
	FunctionDeclaration,
	Identifier,
	IfStatement,
	MemberExpr,
	NumericLiteral,
	ObjectLiteral,
	Program,
	ReturnStatement,
	Stmt,
	StringLiteral,
	VarDeclaration,
  WhileStatement,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import {
	eval_function_declaration,
	eval_if_statement,
	eval_program,
	eval_return_statement,
	eval_var_declaration,
  eval_while_statement,
} from "./eval/statements.ts";
import {
eval_array_expr,
	eval_assignment,
	eval_binary_expr,
	eval_call_expr,
	eval_identifier,
	eval_member_expr,
	eval_object_expr,
} from "./eval/expressions.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
	switch (astNode.kind) {
		case "NumericLiteral":
			return {
				value: (astNode as NumericLiteral).value,
				type: "number",
			} as NumberVal;
		case "StringLiteral":
			return{
				value: (astNode as StringLiteral).value,
				type: "string"
			} as StringVal	
		case "Identifier":
			return eval_identifier(astNode as Identifier, env);
		case "ObjectLiteral":
			return eval_object_expr(astNode as ObjectLiteral, env);
		case "CallExpr":
			return eval_call_expr(astNode as CallExpr, env);
		case "AssignmentExpr":
			return eval_assignment(astNode as AssignmentExpr, env);
		case "BinaryExpr":
			return eval_binary_expr(astNode as BinaryExpr, env);
		case "IfStatement":
			return eval_if_statement(astNode as IfStatement, env);
		case "WhileStatement":
			return eval_while_statement(astNode as WhileStatement, env)	;
		case "Program":
			return eval_program(astNode as Program, env);
		case "VarDeclaration":
			return eval_var_declaration(astNode as VarDeclaration, env);
		case "FunctionDeclaration":
			return eval_function_declaration(astNode as FunctionDeclaration, env);
		case "ReturnStatement":
			return eval_return_statement(astNode as ReturnStatement, env)	
		case "MemberExpr":
			return eval_member_expr(astNode as MemberExpr, env)	
		case "ArrayLiteral":
			return eval_array_expr(astNode as ArrayLiteral, env)	
		default:
			console.error(
				"This AST Node has not yet been setup for interpretation.\n",
				astNode
			);
			Deno.exit(0);
	}
}
