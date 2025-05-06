import {
  ArrayLiteral,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  MemberExpr,
  ObjectLiteral,
} from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
  ArrayVal,
  BooleanVal,
  FunctionValue,
  MK_BOOL,
  MK_NULL,
  NativeFnValue,
  NumberVal,
  ObjectVal,
  RuntimeVal,
  StringVal,
} from "../values.ts";

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
    // TODO: Division by zero checks
    result = lhs.value / rhs.value;
  } else {
    result = lhs.value % rhs.value;
  }

  return { value: result, type: "number" };
}

function eval_comparission_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string
): BooleanVal {
  let result: boolean;

  switch (operator) {
    case "==":
      result = lhs.value == rhs.value;
      break;
    case "!=":
      result = lhs.value != rhs.value;
      break;
    case "<":
      result = lhs.value < rhs.value;
      break;
    case ">":
      result = lhs.value > rhs.value;
      break;
    case ">=":
      result = lhs.value >= rhs.value;
      break;
    case "<=":
      result = lhs.value <= rhs.value;
      break;
    default:
      throw "unknown operator" + operator;
  }

  return MK_BOOL(result);
}

export function eval_binary_expr(
  binop: BinaryExpr,
  env: Environment
): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);
  if (["==", "<", ">", ">=", "<=", "!="].includes(binop.operator)) {
    return eval_comparission_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator
    );
  }
  // Only currently support numeric operations
  if (lhs.type == "number" && rhs.type == "number") {
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator
    );
  }

  // One or both are NULL
  return MK_NULL();
}

export function eval_identifier(
  ident: Identifier,
  env: Environment
): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function eval_assignment(
  node: AssignmentExpr,
  env: Environment
): RuntimeVal {
  if (node.assigne.kind === "Identifier") {
    const varname = (node.assigne as Identifier).symbol;
    return env.assignVar(varname, evaluate(node.value, env));
  }

  if (node.assigne.kind === "MemberExpr") {
    const memberExpr = node.assigne as MemberExpr;
    const obj = evaluate(memberExpr.object, env);
    const objectVal = obj as ObjectVal;
    let propName: string;

    if (memberExpr.computed) {
      const prop = evaluate(memberExpr.property, env);
      if (prop.type === "number") {
        propName = (prop as NumberVal).value.toString();
      } else if (prop.type === "string") {
        propName = (prop as StringVal).value;
      } else {
        throw `Invalid property key type: ${prop.type}`;
      }
    } else {
      if (memberExpr.property.kind !== "Identifier") {
        throw `Invalid non-computed property key: ${JSON.stringify(
          memberExpr.property
        )}`;
      }
      propName = (memberExpr.property as Identifier).symbol;
    }

    const newValue = evaluate(node.value, env);
    objectVal.properties.set(propName, newValue);
    return newValue;
  }

  throw `Invalid LHS in assignment: ${JSON.stringify(node.assigne)}`;
}

export function eval_object_expr(
  obj: ObjectLiteral,
  env: Environment
): RuntimeVal {
  const object = { type: "object", properties: new Map() } as ObjectVal;
  for (const { key, value } of obj.properties) {
    const runtimeVal =
      value == undefined ? env.lookupVar(key) : evaluate(value, env);

    object.properties.set(key, runtimeVal);
  }

  return object;
}

export function eval_array_expr(array: ArrayLiteral, env: Environment) {
  const arrayValues: RuntimeVal[] = [];

  for (const expr of array.value) {
    const value = evaluate(expr, env);
    arrayValues.push(value);
  }

  return {
    type: "array",
    value: arrayValues,
  } as ArrayVal;
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(expr.caller, env);

  if (fn.type == "native-fn") {
    const result = (fn as NativeFnValue).call(args, env);
    return result;
  }

  if (fn.type == "function") {
    const func = fn as FunctionValue;
    const scope = new Environment(func.declarationEnv);

    // Create the variables for the parameters list
    for (let i = 0; i < func.parameters.length; i++) {
      // TODO Check the bounds here.
      // verify arity of function
      const varname = func.parameters[i];
      scope.declareVar(varname, args[i], false);
    }

    let result: RuntimeVal = MK_NULL();
    // Evaluate the function body line by line
    for (const stmt of func.body) {
      const evaluated = evaluate(stmt, scope);
      if (stmt.kind == "ReturnStatement") {
        result = evaluated;
        break;
      }
    }

    return result;
  }

  throw "Cannot call value that is not a function: " + JSON.stringify(fn);
}

export function eval_member_expr(
	expr: MemberExpr,
	env: Environment
  ): RuntimeVal {
	const target = evaluate(expr.object, env);
  
	if (expr.computed) {
	  const property = evaluate(expr.property, env);
  
	  if (target.type === "array") {
		if (property.type !== "number") {
		  throw "array index must be number";
		}
		const index = (property as NumberVal).value ;
		const array = target as ArrayVal;
  
		if (index < 0 || index >= array.value.length) {
		  return MK_NULL();
		}
  
		return array.value[index - 1];
	  } else if (target.type === "object") {
		let propName: string;
		const objectVal = target as ObjectVal;
  
		if (property.type === "number") {
		  propName = (property as NumberVal).value.toString();
		} else if (property.type === "string") {
		  // deno-lint-ignore no-explicit-any
		  propName = (property as any).value;
		} else {
		  throw `Invalid property type: ${property.type}. Expected string or number.`;
		}
  
		if (!objectVal.properties.has(propName)) {
		  return MK_NULL();
		}
		return objectVal.properties.get(propName) as RuntimeVal;
	  } else {
		throw `Cannot use computed property on type: ${target.type}`;
	  }
	} else {
	  if (target.type !== "object") {
		throw `Cannot use dot notation on non-object type: ${target.type}`;
	  }
	  const objectVal = target as ObjectVal;
	  if (expr.property.kind !== "Identifier") {
		throw `Invalid property access: ${JSON.stringify(expr.property)}`;
	  }
	  const propName = (expr.property as Identifier).symbol;
	  return objectVal.properties.get(propName) ?? MK_NULL();
	}
}
  
