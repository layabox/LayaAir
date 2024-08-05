import { ShaderVariable } from "../RenderEngine/RenderShader/ShaderVariable";

/**
 * @private
 * @en CommandEncoder Shader variable collection
 * @zh CommandEncoder Shader变量集合
 */
export class CommandEncoder {
    /**
     * @internal
     * @en Shader variable list
     * @zh Shader变量列表
     */
    _idata: ShaderVariable[] = [];

    /**
     * @en Constructor method, initialize CommandEncoder object
     * @zh 构造方法，初始化CommandEncoder对象
     */
    constructor() {
    }

    /**
     * @internal
     * @en Get the Shader variable list
     * @zh 获取ShaderVariable数组
     */
    getArrayData(): ShaderVariable[] {
        return this._idata;
    }

    /**
     * @internal
     * @en Get the count of ShaderVariables in the array
     * @zh 获取ShaderVariable数组的数量    
     */
    getCount(): number {
        return this._idata.length;
    }

    /**
     * @internal
     * @en Add one ShaderVariable
     * @param variable The ShaderVariable to be added
     * @zh 添加一个ShaderVariable
     * @param variable 要添加的ShaderVariable
     */
    addShaderUniform(variable: ShaderVariable): void {
        this._idata.push(variable);
    }

}

