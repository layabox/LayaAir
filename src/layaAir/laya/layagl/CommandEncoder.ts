import { ShaderVariable } from "../RenderEngine/RenderShader/ShaderVariable";

/**
 * @private
 * CommandEncoder Shader变量集合
 */
export class CommandEncoder {
    
    /**@internal shader variable list*/
    _idata: ShaderVariable[] = [];

    /**
     * 实例化一个ShaderVariable集合
     */
    constructor() {
    }

    /**
     * @internal
     * @returns Array of ShaderVariable
     */
    getArrayData(): ShaderVariable[] {
        return this._idata;
    }

    /**
     * @internal
     * @returns count of ShaderVariableArray
     */
    getCount(): number {
        return this._idata.length;
    }

    /**
     * @internal
     * add one ShaderVariable
     * @param variable 
     */
    addShaderUniform(variable: ShaderVariable): void {
        this._idata.push(variable);
    }

}

