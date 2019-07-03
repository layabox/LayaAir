import { ShaderPass } from "./ShaderPass";
import { ShaderDefines } from "./ShaderDefines";
/**
 * <code>SubShader</code> 类用于创建SubShader。
 */
export declare class SubShader {
    /**
     * 创建一个 <code>SubShader</code> 实例。
     * @param	attributeMap  顶点属性表。
     * @param	uniformMap  uniform属性表。
     * @param	spriteDefines  spriteDefines 精灵宏定义。
     * @param	materialDefines  materialDefines 材质宏定义。
     */
    constructor(attributeMap: any, uniformMap: any, spriteDefines?: ShaderDefines, materialDefines?: ShaderDefines);
    /**
     * 通过名称获取宏定义值。
     * @param	name 名称。
     * @return 宏定义值。
     */
    getMaterialDefineByName(name: string): number;
    /**
     *添加标记。
     * @param key 标记键。
     * @param value 标记值。
     */
    setFlag(key: string, value: string): void;
    /**
     * 获取标记值。
     * @return key 标记键。
     */
    getFlag(key: string): string;
    /**
     * 添加着色器Pass
     * @param vs
     * @param ps
     * @param stateMap
     */
    addShaderPass(vs: string, ps: string, stateMap?: any): ShaderPass;
}
