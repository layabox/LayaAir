import { WebGL } from "../../webgl/WebGL";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
/**
 * <code>Shader3D</code> 类用于创建Shader3D。
 */
export class Shader3D {
    /**
     * 创建一个 <code>Shader3D</code> 实例。
     */
    constructor(name, attributeMap, uniformMap, enableInstancing) {
        /**@private */
        this._attributeMap = null;
        /**@private */
        this._uniformMap = null;
        /**@private */
        this._enableInstancing = false;
        /**@private */
        this._subShaders = [];
        this._name = name;
        this._attributeMap = attributeMap;
        this._uniformMap = uniformMap;
        this._enableInstancing = enableInstancing;
    }
    /**
     * 通过Shader属性名称获得唯一ID。
     * @param name Shader属性名称。
     * @return 唯一ID。
     */
    static propertyNameToID(name) {
        if (Shader3D._propertyNameMap[name] != null) {
            return Shader3D._propertyNameMap[name];
        }
        else {
            var id = Shader3D._propertyNameCounter++;
            Shader3D._propertyNameMap[name] = id;
            return id;
        }
    }
    /**
     * @private
     */
    static addInclude(fileName, txt) {
        txt = txt.replace(ShaderCompile._clearCR, ""); //CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
        ShaderCompile.addInclude(fileName, txt);
    }
    /**
     * @private
     */
    static registerPublicDefine(name) {
        var value = Math.pow(2, Shader3D._publicCounter++); //TODO:超界处理
        Shader3D._globleDefines[value] = name;
        return value;
    }
    /**
     * 编译shader。
     * @param	name Shader名称。
     * @param   subShaderIndex 子着色器索引。
     * @param   passIndex  通道索引。
     * @param	publicDefine 公共宏定义值。
     * @param	spriteDefine 精灵宏定义值。
     * @param	materialDefine 材质宏定义值。
     */
    static compileShader(name, subShaderIndex, passIndex, publicDefine, spriteDefine, materialDefine) {
        var shader = Shader3D.find(name);
        if (shader) {
            var subShader = shader.getSubShaderAt(subShaderIndex);
            if (subShader) {
                var pass = subShader._passes[passIndex];
                if (pass) {
                    if (WebGL.shaderHighPrecision) //部分低端移动设备不支持高精度shader,所以如果在PC端或高端移动设备输出的宏定义值需做判断移除高精度宏定义
                        pass.withCompile(publicDefine, spriteDefine, materialDefine);
                    else
                        pass.withCompile(publicDefine - Shader3D.SHADERDEFINE_HIGHPRECISION, spriteDefine, materialDefine);
                }
                else {
                    console.warn("Shader3D: unknown passIndex.");
                }
            }
            else {
                console.warn("Shader3D: unknown subShaderIndex.");
            }
        }
        else {
            console.warn("Shader3D: unknown shader name.");
        }
    }
    /**
     * @private
     * 添加预编译shader文件，主要是处理宏定义
     */
    static add(name, attributeMap = null, uniformMap = null, enableInstancing = false) {
        return Shader3D._preCompileShader[name] = new Shader3D(name, attributeMap, uniformMap, enableInstancing);
    }
    /**
     * 获取ShaderCompile3D。
     * @param	name
     * @return ShaderCompile3D。
     */
    static find(name) {
        return Shader3D._preCompileShader[name];
    }
    /**
     * 添加子着色器。
     * @param 子着色器。
     */
    addSubShader(subShader) {
        this._subShaders.push(subShader);
        subShader._owner = this;
    }
    /**
     * 在特定索引获取子着色器。
     * @param	index 索引。
     * @return 子着色器。
     */
    getSubShaderAt(index) {
        return this._subShaders[index];
    }
}
/**渲染状态_剔除。*/
Shader3D.RENDER_STATE_CULL = 0;
/**渲染状态_混合。*/
Shader3D.RENDER_STATE_BLEND = 1;
/**渲染状态_混合源。*/
Shader3D.RENDER_STATE_BLEND_SRC = 2;
/**渲染状态_混合目标。*/
Shader3D.RENDER_STATE_BLEND_DST = 3;
/**渲染状态_混合源RGB。*/
Shader3D.RENDER_STATE_BLEND_SRC_RGB = 4;
/**渲染状态_混合目标RGB。*/
Shader3D.RENDER_STATE_BLEND_DST_RGB = 5;
/**渲染状态_混合源ALPHA。*/
Shader3D.RENDER_STATE_BLEND_SRC_ALPHA = 6;
/**渲染状态_混合目标ALPHA。*/
Shader3D.RENDER_STATE_BLEND_DST_ALPHA = 7;
/**渲染状态_混合常量颜色。*/
Shader3D.RENDER_STATE_BLEND_CONST_COLOR = 8;
/**渲染状态_混合方程。*/
Shader3D.RENDER_STATE_BLEND_EQUATION = 9;
/**渲染状态_RGB混合方程。*/
Shader3D.RENDER_STATE_BLEND_EQUATION_RGB = 10;
/**渲染状态_ALPHA混合方程。*/
Shader3D.RENDER_STATE_BLEND_EQUATION_ALPHA = 11;
/**渲染状态_深度测试。*/
Shader3D.RENDER_STATE_DEPTH_TEST = 12;
/**渲染状态_深度写入。*/
Shader3D.RENDER_STATE_DEPTH_WRITE = 13;
/**shader变量提交周期，自定义。*/
Shader3D.PERIOD_CUSTOM = 0;
/**shader变量提交周期，逐材质。*/
Shader3D.PERIOD_MATERIAL = 1;
/**shader变量提交周期，逐精灵和相机，注：因为精灵包含MVP矩阵，为复合属性，所以摄像机发生变化时也应提交。*/
Shader3D.PERIOD_SPRITE = 2;
/**shader变量提交周期，逐相机。*/
Shader3D.PERIOD_CAMERA = 3;
/**shader变量提交周期，逐场景。*/
Shader3D.PERIOD_SCENE = 4;
/**@private */
Shader3D._propertyNameCounter = 0;
/**@private */
Shader3D._propertyNameMap = {};
/**@private */
Shader3D._publicCounter = 0;
/**@private */
Shader3D._globleDefines = [];
/**@private */
Shader3D._preCompileShader = {};
/**是否开启调试模式。 */
Shader3D.debugMode = true;
