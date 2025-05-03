import Parser from "./frontend/parser.ts";

repl();


function repl(){
    const parser = new Parser();
    console.log("Repl v0.1");
    while (true) {

        const input = prompt("> ");

        if(!input || input.includes("exit")){
            Deno.exit(1);
        }

        const programm = parser.produceAsT(input);
        console.log(programm);
    }
}