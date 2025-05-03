import Parser from "./frontend/parser.ts";
import Enviroment from "./runtime/enviroment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_NUMBER, MK_NULL, MK_BOOL} from "./runtime/values.ts";

repl();


function repl(){
    const parser = new Parser();
    const env = new Enviroment();
    env.declareVar("x", MK_NUMBER(100));
    env.declareVar("true", MK_BOOL(true));
    env.declareVar("false", MK_BOOL(false));
    env.declareVar("null", MK_NULL());
    console.log("Repl v0.1");
    while (true) {

        const input = prompt("> ");

        if(!input || input.includes("exit")){
            Deno.exit(1);
        }

        const program = parser.produceAsT(input);

        const result = evaluate(program, env);
        console.log(result);
 
        
        
    }
}