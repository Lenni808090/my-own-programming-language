import { RuntimeVal } from "./values.ts";

export default class Enviroment {
    private parent?: Enviroment;
    private variables: Map<string, RuntimeVal>;

    constructor(parentENV?: Enviroment){
        this.parent = parentENV;
        this.variables = new Map();
    }

    public declareVar(varname: string, value: RuntimeVal): RuntimeVal {
        if(this.variables.has(varname)){
            throw "Cannot declare variable as its already defindes"
        }

        this.variables.set(varname, value);
        return value;
    }

    public assignVar (varname: string, value: RuntimeVal): RuntimeVal{
        const env = this.resolve(varname);
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

    public lookUpVAr(varname: string): RuntimeVal{
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }
}