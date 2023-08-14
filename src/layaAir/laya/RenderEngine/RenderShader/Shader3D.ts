import { LayaGL } from "../../layagl/LayaGL";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
import { DefineDatas } from "./DefineDatas";
import { ShaderData } from "./ShaderData";
import { ShaderDefine } from "./ShaderDefine";
import { ShaderPass } from "./ShaderPass";
import { ShaderVariant, ShaderVariantCollection } from "./ShaderVariantCollection";
import { SubShader } from "./SubShader";

export interface IShaderObjStructor {
    name: string,
    enableInstancing: boolean,
    supportReflectionProbe: boolean,
    attributeMap: any;
    uniformMap: any;
    defaultValue: any;
    shaderPass: Array<any>;
}

export interface IShaderpassStructor {
    VS?: string,
    FS?: string,
    VSPath?: string,//TODO
    FSPath?: string,//TODO
    pipeline?: string,
    statefirst?: boolean;
    renderState?: Record<string, string | boolean | number | string[]>

}
/**
 * <code>Shader3D</code> 类用于创建Shader3D。
 */
export class Shader3D {
    static _configDefineValues = new DefineDatas();
    /**@internal */
    private static _compileDefineDatas: DefineDatas = new DefineDatas();
    /**渲染状态_剔除。*/
    static CULL: number;
    /**渲染状态_混合。*/
    static BLEND: number;
    /**渲染状态_混合源。*/
    static BLEND_SRC: number;
    /**渲染状态_混合目标。*/
    static BLEND_DST: number;
    /**渲染状态_混合源RGB。*/
    static BLEND_SRC_RGB: number;
    /**渲染状态_混合目标RGB。*/
    static BLEND_DST_RGB: number;
    /**渲染状态_混合源ALPHA。*/
    static BLEND_SRC_ALPHA: number;
    /**渲染状态_混合目标ALPHA。*/
    static BLEND_DST_ALPHA: number;
    /**渲染状态_混合方程。*/
    static BLEND_EQUATION: number;
    /**渲染状态_混合方程。*/
    static BLEND_EQUATION_RGB: number;
    /**渲染状态_ALPHA混合方程。*/
    static BLEND_EQUATION_ALPHA: number;
    /**渲染状态_深度测试。*/
    static DEPTH_TEST: number;
    /**渲染状态_深度写入。*/
    static DEPTH_WRITE: number;
    /**渲染状态_模板测试。*/
    static STENCIL_TEST: number;
    /**渲染状态_模板写入 */
    static STENCIL_WRITE: number;
    /**渲染状态_模板写入值 */
    static STENCIL_Ref: number;
    /**渲染状态_模板写入设置 */
    static STENCIL_Op: number;

    /**shader变量提交周期，自定义。*/
    static PERIOD_CUSTOM: number = 0;
    /**shader变量提交周期，逐材质。*/
    static PERIOD_MATERIAL: number = 1;
    /**shader变量提交周期，逐精灵和相机，注：因为精灵包含MVP矩阵，为复合属性，所以摄像机发生变化时也应提交。*/
    static PERIOD_SPRITE: number = 2;
    /**shader变量提交周期，逐相机。*/
    static PERIOD_CAMERA: number = 3;
    /**shader变量提交周期，逐场景。*/
    static PERIOD_SCENE: number = 4;

    /**@internal */
    static SHADERDEFINE_LEGACYSINGALLIGHTING: ShaderDefine;
    /**@internal 图形数据传输使用UniformBlock的方式 */
    static SHADERDEFINE_ENUNIFORMBLOCK: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_FLOATTEXTURE: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_FLOATTEXTURE_FIL_LINEAR: ShaderDefine;
    /**@internal */
    static _propertyNameMap: any = {};
    /**@internal */
    private static _propertyNameCounter: number = 0;
    /**@internal */
    private static _defineCounter: number = 0;
    // todo  这个 map 和 get 函数转移到 ShaderDefine 里面
    /**@internal */
    private static _defineMap: { [key: string]: ShaderDefine } = {};
    /**@internal */
    static _preCompileShader: { [key: string]: Shader3D } = {};
    /**@internal */
    static _maskMap: Array<{ [key: number]: string }> = [];
    /**@internal */
    static _debugShaderVariantInfo: ShaderVariant;
    /**是否开启调试模式。 */
    static debugMode: boolean = false;
    /**调试着色器变种集合。 */
    static debugShaderVariantCollection: ShaderVariantCollection;


    static init() {
        Shader3D.debugShaderVariantCollection = new ShaderVariantCollection();
    }

    /**
     * @internal
     */
    static _getNamesByDefineData(defineData: DefineDatas, out: Array<string>): void {
        var maskMap: Array<{ [key: number]: string }> = Shader3D._maskMap;
        var mask: Array<number> = defineData._mask;
        out.length = 0;
        for (var i: number = 0, n: number = defineData._length; i < n; i++) {
            var subMaskMap: { [key: number]: string } = maskMap[i];
            var subMask: number = mask[i];
            for (var j: number = 0; j < 32; j++) {
                var d: number = 1 << j;
                if (subMask > 0 && d > subMask)//如果31位存在subMask为负数,避免break
                    break;
                if (subMask & d)
                    out.push(subMaskMap[d]);
            }
        }
    }

    /**
     * 注册宏定义。
     * @param name 
     */
    static getDefineByName(name: string): ShaderDefine {
        var define: ShaderDefine = Shader3D._defineMap[name];
        if (!define) {
            var maskMap = Shader3D._maskMap;
            var counter: number = Shader3D._defineCounter;
            var index: number = Math.floor(counter / 32);
            var value: number = 1 << counter % 32;
            define = new ShaderDefine(index, value);
            Shader3D._defineMap[name] = define;
            if (index == maskMap.length) {
                maskMap.length++;
                maskMap[index] = {};
            }
            maskMap[index][value] = name;
            Shader3D._defineCounter++;
        }
        return define;
    }

    /**
     * 通过Shader属性名称获得唯一ID。
     * @param name Shader属性名称。
     * @return 唯一ID。
     */
    static propertyNameToID(name: string): number {
        return LayaGL.renderEngine.propertyNameToID(name);
    }

    static propertyIDToName(id: number): string {
        return LayaGL.renderEngine.propertyIDToName(id);
    }

    /**
     * 添加函数库引用。
     * @param fileName 文件名字。
     * @param txt 文件内容
     */
    static addInclude(fileName: string, txt: string): void {
        ShaderCompile.addInclude(fileName, txt);
    }

    /**
     * 通过宏定义名字编译shader。
     * @param	shaderName Shader名称。
     * @param   subShaderIndex 子着色器索引。
     * @param   passIndex  通道索引。
     * @param	defineNames 宏定义名字集合。
     */
    static compileShaderByDefineNames(shaderName: string, subShaderIndex: number, passIndex: number, defineNames: string[], nodeCommonMap: string[]): void {
        var shader: Shader3D = Shader3D.find(shaderName);
        if (shader) {
            var subShader: SubShader = shader.getSubShaderAt(subShaderIndex);
            if (subShader) {
                var pass: ShaderPass = subShader._passes[passIndex];
                pass.nodeCommonMap = nodeCommonMap;
                if (pass) {
                    var compileDefineDatas: DefineDatas = Shader3D._compileDefineDatas;
                    Shader3D._configDefineValues.cloneTo(compileDefineDatas);
                    for (var i: number = 0, n: number = defineNames.length; i < n; i++)
                        compileDefineDatas.add(Shader3D.getDefineByName(defineNames[i]));
                    pass.withCompile(compileDefineDatas);
                } else {
                    console.warn("Shader3D: unknown passIndex.");
                }
            } else {
                console.warn("Shader3D: unknown subShaderIndex.");
            }
        } else {
            console.warn("Shader3D: unknown shader name.");
        }
    }

    /**
     * 添加预编译shader文件，主要是处理宏定义
     */
    static add(name: string, enableInstancing: boolean = false, supportReflectionProbe: boolean = false): Shader3D {
        return Shader3D._preCompileShader[name] = new Shader3D(name, enableInstancing, supportReflectionProbe);
    }

    /**
     * 获取ShaderCompile3D。
     * @param	name
     * @return ShaderCompile3D。
     */
    static find(name: string): Shader3D {
        return Shader3D._preCompileShader[name];
    }

    static parse(data: IShaderObjStructor, basePath: string) {
        if (!data.name || !data.uniformMap)
            console.error("TODO");
        let shader = Shader3D.add(data.name, data.enableInstancing, data.supportReflectionProbe);
        let subshader = new SubShader(data.attributeMap ? data.attributeMap : SubShader.DefaultAttributeMap, data.uniformMap, data.defaultValue);
        shader.addSubShader(subshader);
        let passArray = data.shaderPass;
        for (var i in passArray) {
            let pass = passArray[i] as IShaderpassStructor;
            subshader._addShaderPass(ShaderCompile.compile(pass.VS, pass.FS, basePath), pass.pipeline);
        }
        return shader;
    }

    /**@internal */
    _name: string;
    /**@internal */
    _enableInstancing: boolean = false;
    /**@internal */
    _supportReflectionProbe: boolean = false;
    /**@internal */
    _subShaders: SubShader[] = [];

    /**
     * 名字。
     */
    get name(): string {
        return this._name;
    }

    /**
     * 创建一个 <code>Shader3D</code> 实例。
     */
    constructor(name: string, enableInstancing: boolean, supportReflectionProbe: boolean) {
        this._name = name;
        this._enableInstancing = enableInstancing;
        this._supportReflectionProbe = supportReflectionProbe;
    }

    /**
     * 添加子着色器。
     * @param 子着色器。
     */
    addSubShader(subShader: SubShader): void {
        this._subShaders.push(subShader);
        subShader._owner = this;
    }

    /**
     * 在特定索引获取子着色器。
     * @param	index 索引。
     * @return 子着色器。
     */
    getSubShaderAt(index: number): SubShader {
        return this._subShaders[index];
    }

}


