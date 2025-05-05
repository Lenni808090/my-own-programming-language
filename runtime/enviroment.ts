import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, RuntimeVal } from "./values.ts";

export function createGlobalEnv() {
    const env = new Enviroment();
    // Create Default Global Enviornment
    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);
    
    env.declareVar("print", MK_NATIVE_FN((args, scope) => {
        console.log(...args);
        return MK_NULL()
    }), true);

    function timeFunction(_args: RuntimeVal[], _env: Enviroment){
        return MK_NUMBER(Date.now());
    }
    env.declareVar("time", MK_NATIVE_FN(timeFunction), true)

    return env;
  }
  


export default class Enviroment {
    private parent?: Enviroment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor(parentENV?: Enviroment){
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar(varname: string, value: RuntimeVal, constant: boolean): RuntimeVal {
        if(this.variables.has(varname)){
            throw "Cannot declare variable as its already defindes"
        }

        this.variables.set(varname, value);
        if(constant){
            this.constants.add(varname)
        }
        return value;
    }

    public assignVar (varname: string, value: RuntimeVal): RuntimeVal{
        const env = this.resolve(varname);
        if(env.constants.has(varname)){
            throw "Cannot reasign constant Variabels: " +  varname;
        }
        env.variables.set(varname, value);
        return value;
    }

    public resolve(varname: string ): Enviroment{
        if(this.variables.has(varname)){
            return this;
        }

        if(this.parent == undefined){
            throw `Cannot resolve ${varname} as it does not exist`;
        }

        return this.parent.resolve(varname)
    }

    public lookUpVar(varname: string): RuntimeVal{
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }
}