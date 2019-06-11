import { Shader3D } from "././Shader3D";
import { ShaderPass } from "././ShaderPass";
/**
 * <code>SubShader</code> 类用于创建SubShader。
 */
export class SubShader {
    /**
     * 创建一个 <code>SubShader</code> 实例。
     * @param	attributeMap  顶点属性表。
     * @param	uniformMap  uniform属性表。
     * @param	spriteDefines  spriteDefines 精灵宏定义。
     * @param	materialDefines  materialDefines 材质宏定义。
     */
    constructor(attributeMap, uniformMap, spriteDefines = null, materialDefines = null) {
        /**@private */
        this._flags = {};
        /**@private */
        this._passes = [];
        this._publicDefines = [];
        this._publicDefinesMap = {};
        this._spriteDefines = [];
        this._spriteDefinesMap = {};
        this._materialDefines = [];
        this._materialDefinesMap = {};
        this._addDefines(this._publicDefines, this._publicDefinesMap, Shader3D._globleDefines);
        (spriteDefines) && (this._addDefines(this._spriteDefines, this._spriteDefinesMap, spriteDefines.defines));
        (materialDefines) && (this._addDefines(this._materialDefines, this._materialDefinesMap, materialDefines.defines));
        this._attributeMap = attributeMap;
        this._uniformMap = uniformMap;
    }
    /**
     * @private
     */
    _addDefines(defines, definesMap, supportDefines) {
        for (var k in supportDefines) {
            var name = supportDefines[k];
            var i = parseInt(k);
            defines[i] = name;
            definesMap[name] = i;
        }
    }
    /**
     * 通过名称获取宏定义值。
     * @param	name 名称。
     * @return 宏定义值。
     */
    getMaterialDefineByName(name) {
        return this._materialDefinesMap[name];
    }
    /**
     *添加标记。
     * @param key 标记键。
     * @param value 标记值。
     */
    setFlag(key, value) {
        if (value)
            this._flags[key] = value;
        else
            delete this._flags[key];
    }
    /**
     * 获取标记值。
     * @return key 标记键。
     */
    getFlag(key) {
        return this._flags[key];
    }
    /**
     * @private
     */
    addShaderPass(vs, ps, stateMap = null) {
        var shaderPass = new ShaderPass(this, vs, ps, stateMap);
        this._passes.push(shaderPass);
        return shaderPass;
    }
}
