import { Loader } from "../../../net/Loader";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { Handler } from "../../../utils/Handler";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataDefaultValue, ShaderDataItem, ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { IClone } from "../../../utils/IClone";
import { LayaGL } from "../../../layagl/LayaGL";
import { Config3D } from "../../../../Config3D";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { ILaya } from "../../../../ILaya";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { Event } from "../../../events/Event";
import { Config } from "../../../../Config";

export enum MaterialRenderMode {
    /**渲染状态_不透明。*/
    RENDERMODE_OPAQUE,
    /**渲染状态_阿尔法测试。*/
    RENDERMODE_CUTOUT,
    /**渲染状态__透明。*/
    RENDERMODE_TRANSPARENT,
    /**渲染状态__加色法混合。*/
    RENDERMODE_ADDTIVE,
    /**渲染状态_透明混合。*/
    RENDERMODE_ALPHABLENDED,
    /**渲染状态_自定义 */
    RENDERMODE_CUSTOME
}

/**
 * <code>Material</code> 类用于创建材质。
 */
export class Material extends Resource implements IClone {
    /** 渲染队列_不透明。*/
    static RENDERQUEUE_OPAQUE: number = 2000;
    /** 渲染队列_阿尔法裁剪。*/
    static RENDERQUEUE_ALPHATEST: number = 2450;
    /** 渲染队列_透明。*/
    static RENDERQUEUE_TRANSPARENT: number = 3000;

    /**着色器变量,透明测试值。*/
    static ALPHATESTVALUE: number;

    /**材质级着色器宏定义,透明测试。*/
    static SHADERDEFINE_ALPHATEST: ShaderDefine;
    static SHADERDEFINE_MAINTEXTURE: ShaderDefine;
    static SHADERDEFINE_ADDTIVEFOG: ShaderDefine;
    /**
     * 加载材质。
     * @param url 材质地址。
     * @param complete 完成回掉。
     */
    static load(url: string, complete: Handler): void {
        ILaya.loader.load(url, complete, null, Loader.MATERIAL);
    }

    /**
     * @internal
     */
    static __initDefine__(): void {
        Material.SHADERDEFINE_ALPHATEST = Shader3D.getDefineByName("ALPHATEST");
        Material.SHADERDEFINE_MAINTEXTURE = Shader3D.getDefineByName("MAINTEXTURE");
        Material.SHADERDEFINE_ADDTIVEFOG = Shader3D.getDefineByName("ADDTIVEFOG");
        Material.ALPHATESTVALUE = Shader3D.propertyNameToID("u_AlphaTestValue");
        Shader3D.CULL = Shader3D.propertyNameToID("s_Cull");
        Shader3D.BLEND = Shader3D.propertyNameToID("s_Blend");
        Shader3D.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
        Shader3D.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
        Shader3D.BLEND_SRC_RGB = Shader3D.propertyNameToID("s_BlendSrcRGB");
        Shader3D.BLEND_DST_RGB = Shader3D.propertyNameToID("s_BlendDstRGB");
        Shader3D.BLEND_SRC_ALPHA = Shader3D.propertyNameToID("s_BlendSrcAlpha");
        Shader3D.BLEND_DST_ALPHA = Shader3D.propertyNameToID("s_BlendDstAlpha");
        Shader3D.BLEND_EQUATION = Shader3D.propertyNameToID("s_BlendEquation");
        Shader3D.BLEND_EQUATION_RGB = Shader3D.propertyNameToID("s_BlendEquationRGB");
        Shader3D.BLEND_EQUATION_ALPHA = Shader3D.propertyNameToID("s_BlendEquationAlpha");
        Shader3D.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
        Shader3D.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
        Shader3D.STENCIL_Ref = Shader3D.propertyNameToID("s_StencilRef");
        Shader3D.STENCIL_TEST = Shader3D.propertyNameToID("s_StencilTest");
        Shader3D.STENCIL_WRITE = Shader3D.propertyNameToID("s_StencilWrite");
        Shader3D.STENCIL_Op = Shader3D.propertyNameToID("s_StencilOp");
    }

    /**@internal */
    private _matRenderNode: MaterialRenderMode;
    /** @internal */
    _shader: Shader3D;
    /** @private */
    _shaderValues: ShaderData | null;//TODO:剥离贴图ShaderValue
    /** 所属渲染队列. */
    renderQueue: number;

    /**
     * 着色器数据。
     */
    get shaderData(): ShaderData {
        return this._shaderValues;
    }

    /**
     * 透明测试模式裁剪值。
     */
    get alphaTestValue(): number {
        return this._shaderValues.getNumber(Material.ALPHATESTVALUE);
    }

    set alphaTestValue(value: number) {
        this._shaderValues.setNumber(Material.ALPHATESTVALUE, value);
    }

    /**
     * 是否透明裁剪。
     */
    get alphaTest(): boolean {
        return this.shaderData.hasDefine(Material.SHADERDEFINE_ALPHATEST);
    }

    set alphaTest(value: boolean) {
        if (value)
            this._shaderValues.addDefine(Material.SHADERDEFINE_ALPHATEST);
        else
            this._shaderValues.removeDefine(Material.SHADERDEFINE_ALPHATEST);
    }

    /**
     * 增加Shader宏定义。
     * @param value 宏定义。
     */
    addDefine(define: ShaderDefine): void {
        this._shaderValues.addDefine(define);
    }

    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define: ShaderDefine): void {
        this._shaderValues.removeDefine(define);
    }

    /**
     * 开启 或 关闭 shader 宏定义
     * @param define 
     * @param value true: addDefine, false: removeDefine
     */
    setDefine(define: ShaderDefine, value: boolean) {
        if (value) {
            this._shaderValues.addDefine(define);
        }
        else {
            this._shaderValues.removeDefine(define);
        }
    }

    /**
     * 是否包含Shader宏定义。
     * @param value 宏定义。
     */
    hasDefine(define: ShaderDefine): boolean {
        return this._shaderValues.hasDefine(define);
    }

    /**
     * 是否写入深度。
     */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(Shader3D.DEPTH_WRITE);
    }

    set depthWrite(value: boolean) {
        this._shaderValues.setBool(Shader3D.DEPTH_WRITE, value);
    }


    /**
     * 剔除方式。
     */
    get cull(): number {
        return this._shaderValues.getInt(Shader3D.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(Shader3D.CULL, value);
    }

    /**
     * 混合方式。
     */
    get blend(): number {
        return this._shaderValues.getInt(Shader3D.BLEND);
    }

    set blend(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND, value);
    }


    /**
     * 混合源。
     */
    get blendSrc(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_SRC);
    }

    set blendSrc(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_SRC, value);
    }



    /**
     * 混合目标。
     */
    get blendDst(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_DST);
    }

    set blendDst(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_DST, value);
    }

    /**
     * 混合目标 alpha
     */
    public get blendSrcAlpha(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_SRC_ALPHA);
    }
    public set blendSrcAlpha(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_SRC_ALPHA, value);
    }

    /**
     * 混合原 RGB
     */
    public get blendSrcRGB(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_SRC_RGB);
    }
    /**
     * 混合原 RGB
     */
    public set blendSrcRGB(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_SRC_RGB, value);
    }

    public get blendDstRGB(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_DST_RGB);
    }
    public set blendDstRGB(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_DST_RGB, value);
    }

    /**
     * 混合目标 alpha
     */
    public get blendDstAlpha(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_DST_ALPHA);
    }
    public set blendDstAlpha(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_DST_ALPHA, value);
    }

    /**
     * 混合方程
     */
    public get blendEquation(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_EQUATION);
    }
    public set blendEquation(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_EQUATION, value);
    }

    /**
     * 混合方式 RGB
     */
    public get blendEquationRGB(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_EQUATION_RGB);
    }
    public set blendEquationRGB(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_EQUATION_RGB, value);
    }

    /**
     * 混合方式 Alpha
     */
    public get blendEquationAlpha(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_EQUATION_ALPHA);
    }
    public set blendEquationAlpha(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_EQUATION_ALPHA, value);
    }

    /**
     * 深度测试方式。
     */
    get depthTest(): number {
        return this._shaderValues.getInt(Shader3D.DEPTH_TEST);
    }

    set depthTest(value: number) {
        this._shaderValues.setInt(Shader3D.DEPTH_TEST, value);
    }

    /**
     * 模板测试方式
     */
    get stencilTest(): number {
        return this._shaderValues.getInt(Shader3D.STENCIL_TEST);
    }

    set stencilTest(value: number) {
        this._shaderValues.setInt(Shader3D.STENCIL_TEST, value);
    }

    /**
     * 是否写入模板。
     */
    get stencilWrite(): boolean {
        return this._shaderValues.getBool(Shader3D.STENCIL_WRITE);
    }

    set stencilWrite(value: boolean) {
        this._shaderValues.setBool(Shader3D.STENCIL_WRITE, value);
    }

    /**
     * 写入模板值
     */
    set stencilRef(value: number) {
        this._shaderValues.setInt(Shader3D.STENCIL_Ref, value);
    }

    get stencilRef(): number {
        return this._shaderValues.getInt(Shader3D.STENCIL_Ref);
    }

    /** */
    /**
     * 写入模板测试设置
     * vector(fail, zfail, zpass)
     */
    set stencilOp(value: Vector3) {
        this._shaderValues.setVector3(Shader3D.STENCIL_Op, value);
    }

    get stencilOp(): Vector3 {
        return this._shaderValues.getVector3(Shader3D.STENCIL_Op);
    }

    /**
     * 获得材质属性
     */
    get MaterialProperty(): any {
        let propertyMap: any = {};
        var shaderValues = this._shaderValues.getData();
        for (let key in shaderValues) {
            propertyMap[LayaGL.renderEngine.propertyIDToName(parseInt(key))] = shaderValues[key];
        }
        return propertyMap;
    }

    /**
     * 获得材质宏
     */
    get MaterialDefine(): Array<string> {
        let shaderDefineArray = new Array<string>();
        let defineData = this._shaderValues._defineDatas;
        Shader3D._getNamesByDefineData(defineData, shaderDefineArray);
        return shaderDefineArray;
    }

    /**
     * 渲染模式。
     */
    set materialRenderMode(value: MaterialRenderMode) {
        this._matRenderNode = value;
        switch (value) {
            case MaterialRenderMode.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = Material.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                //this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case MaterialRenderMode.RENDERMODE_CUTOUT:
                this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                //this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case MaterialRenderMode.RENDERMODE_TRANSPARENT:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                //this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case MaterialRenderMode.RENDERMODE_ADDTIVE:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                //this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(Material.SHADERDEFINE_ADDTIVEFOG);
                break;
            case MaterialRenderMode.RENDERMODE_ALPHABLENDED:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                //this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(Material.SHADERDEFINE_ADDTIVEFOG);
                break;
            case MaterialRenderMode.RENDERMODE_CUSTOME:
                //TODO IDE
                break;
            default:
                console.warn(`Material : renderMode value error - (${value}).`);
                break;
        }
    }

    /**
     * 获得材质渲染状态
     */
    get materialRenderMode() {
        return this._matRenderNode;
    }

    /**
     * 创建一个 <code>Material</code> 实例。
     */
    constructor() {
        super();
        this._shaderValues = LayaGL.renderOBJCreate.createShaderData(this);
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;
        this.alphaTest = false;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.blendSrc = RenderState.BLENDPARAM_ONE;
        this.blendDst = RenderState.BLENDPARAM_ZERO;
        this.blendSrcRGB = RenderState.BLENDPARAM_ONE;
        this.blendDstRGB = RenderState.BLENDPARAM_ZERO;
        this.blendSrcAlpha = RenderState.BLENDPARAM_ONE;
        this.blendDstAlpha = RenderState.BLENDPARAM_ZERO;
        this.blendEquation = RenderState.BLENDEQUATION_ADD;
        this.blendEquationRGB = RenderState.BLENDEQUATION_ADD;
        this.blendEquationAlpha = RenderState.BLENDEQUATION_ADD;
        this.depthTest = RenderState.DEPTHTEST_LEQUAL;
        this.depthWrite = true;
        this.stencilRef = 1;
        this.stencilTest = RenderState.STENCILTEST_OFF;
        this.stencilWrite = false;
        this.stencilOp = new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, RenderState.STENCILOP_REPLACE);
        this.destroyedImmediately = Config.destroyResourceImmediatelyDefault;
    }

    /**
     * @internal
     * @param shader 
     * @returns 
     */
    private _bindShaderInfo(shader: Shader3D) {
        //update UBOData by Shader
        let subShader = shader.getSubShaderAt(0);//TODO	
        // ubo
        let shaderUBODatas = subShader._uniformBufferDataMap;
        if (!shaderUBODatas)
            return;
        for (let key of shaderUBODatas.keys()) {
            //create data
            let uboData = shaderUBODatas.get(key).clone();
            //create UBO
            let ubo = UniformBufferObject.create(key, BufferUsage.Dynamic, uboData.getbyteLength(), false);
            this._shaderValues.setUniformBuffer(Shader3D.propertyNameToID(key), ubo);
            this._shaderValues._addCheckUBO(key, ubo, uboData);
        }
    }

    /**
     * @internal
     * 清除UBO
     * @returns 
     */
    private _releaseUBOData() {
        if (!this._shaderValues.uniformBufferDatas) {
            return;
        }
        for (let value of this._shaderValues.uniformBufferDatas.values()) {
            value.ubo._updateDataInfo.destroy();
            value.ubo.destroy();
            value.ubo._updateDataInfo = null;
        }
        this._shaderValues.uniformBufferDatas.clear();
        this._shaderValues.uniformBuffersMap.clear();
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _disposeResource(): void {
        this._releaseUBOData();
        this._shaderValues.destroy();
        this._shaderValues = null;
    }



    /**
     * get all material uniform property 
     * @returns 
     */
    effectiveProperty() {
        return this._shader.getSubShaderAt(0)._uniformTypeMap;
    }

    /**
     * 设置使用Shader名字。
     * @param name 名称。
     */
    setShaderName(name: string): void {
        this._shader = Shader3D.find(name);
        if (!this._shader) {
            //throw new Error("Material: unknown shader name.");
            console.warn(`Material: unknown shader name '${name}'`);
            this._shader = Shader3D.find("BLINNPHONG");
        }

        if (Config3D._uniformBlock) {
            this._releaseUBOData();
            //bind shader info
            // todo 清理残留 shader data
            this._bindShaderInfo(this._shader);
        }

        // set default value
        // todo subShader 选择
        let subShader = this._shader.getSubShaderAt(0);
        let defaultValue = subShader._uniformDefaultValue;
        let typeMap = subShader._uniformTypeMap;
        this.applyUniformDefaultValue(typeMap, defaultValue);
    }

    /**
     * @internal
     */
    applyUniformDefaultValue(typeMap: Map<string, ShaderDataType>, defaultValue: Record<string, ShaderDataItem>) {
        typeMap.forEach((type, key) => {
            if (defaultValue && defaultValue[key] != undefined) {
                let value = defaultValue[key];
                this.setShaderData(key, type, value);
            }
            else {
                this.setShaderData(key, type, ShaderDataDefaultValue(type));
            }
        });
    }

    /**
     * 获得bool属性值
     * @param uniformIndex 属性索引
     * @returns 
     */
    getBoolByIndex(uniformIndex: number): boolean {
        return this.shaderData.getBool(uniformIndex);
    }


    /**
     * 设置bool值
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setBoolByIndex(uniformIndex: number, value: boolean) {
        this.shaderData.setBool(uniformIndex, value);
    }

    /**
     * 活得bool值
     * @param name 属性名称
     * @returns 
     */
    getBool(name: string): boolean {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getBoolByIndex(uniformIndex);
    }

    /**
     * 设置bool值
     * @param name 属性名称
     * @param value 值
     */
    setBool(name: string, value: boolean) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setBoolByIndex(uniformIndex, value);
    }

    /**
     * 获得Float值
     * @param uniformIndex 属性索引
     * @returns 
     */
    getFloatByIndex(uniformIndex: number): number {
        return this.shaderData.getNumber(uniformIndex);
    }

    /**
     * 设置Float值
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setFloatByIndex(uniformIndex: number, value: number) {
        this.shaderData.setNumber(uniformIndex, value);
    }

    /**
     * 获得Float值
     * @param name 属性名称
     * @returns 
     */
    getFloat(name: string): number {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getFloatByIndex(uniformIndex);
    }

    /**
     * 设置Float值
     * @param name 属性名称
     * @param value 值
     */
    setFloat(name: string, value: number) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setFloatByIndex(uniformIndex, value);
    }

    /**
     * 获得Int值
     * @param uniformIndex 属性索引
     * @returns 
     */
    getIntByIndex(uniformIndex: number): number {
        return this.shaderData.getInt(uniformIndex);
    }

    /**
     * 设置Int值
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setIntByIndex(uniformIndex: number, value: number) {
        this.shaderData.setInt(uniformIndex, value);
    }

    /**
     * 获得Int值
     * @param name 属性名称
     * @returns 
     */
    getInt(name: string): number {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getIntByIndex(uniformIndex);
    }

    /**
     * 设置Int值
     * @param name 属性名称
     * @param value 值
     */
    setInt(name: string, value: number) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setIntByIndex(uniformIndex, value);
    }

    /**
     * 获得Vector2
     * @param uniformIndex 属性索引
     * @returns 
     */
    getVector2ByIndex(uniformIndex: number): Vector2 {
        return this.shaderData.getVector2(uniformIndex);
    }

    /**
     * 设置Vector2
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setVector2ByIndex(uniformIndex: number, value: Vector2) {
        this.shaderData.setVector2(uniformIndex, value);
    }

    /**
     * 获得Vector2
     * @param name 属性名称
     * @returns 
     */
    getVector2(name: string): Vector2 {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector2ByIndex(uniformIndex);
    }

    /**
     * 设置Vector2
     * @param name 属性名称
     * @param value 值
     */
    setVector2(name: string, value: Vector2) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector2ByIndex(uniformIndex, value);
    }

    /**
     * 获得Vector3
     * @param uniformIndex 属性索引
     * @returns 
     */
    getVector3ByIndex(uniformIndex: number): Vector3 {
        return this.shaderData.getVector3(uniformIndex);
    }

    /**
     * 设置Vector3
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setVector3ByIndex(uniformIndex: number, value: Vector3) {
        this.shaderData.setVector3(uniformIndex, value);
    }

    /**
     * 获得Vector3
     * @param name 属性名称
     * @returns 
     */
    getVector3(name: string) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector3ByIndex(uniformIndex);
    }

    /**
     * 设置Vector3
     * @param name 属性名称
     * @param value 值
     */
    setVector3(name: string, value: Vector3) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector3ByIndex(uniformIndex, value);
    }

    /**
     * 获得Vector4
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setVector4ByIndex(uniformIndex: number, value: Vector4) {
        this.shaderData.setVector(uniformIndex, value);
    }

    /**
     * 设置Vector4
     * @param uniformIndex 属性索引
     * @returns 
     */
    getVector4ByIndex(uniformIndex: number): Vector4 {
        return this.shaderData.getVector(uniformIndex);
    }

    /**
     * 设置Vector4
     * @param name 属性名称
     * @param value 值
     */
    setVector4(name: string, value: Vector4) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector4ByIndex(uniformIndex, value);
    }

    /**
     * 获得Vector4
     * @param name 属性名称
     * @returns 
     */
    getVector4(name: string) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector4ByIndex(uniformIndex);
    }

    /**
     * 获得Color
     * @param uniformIndex 属性索引
     * @returns 
     */
    getColorByIndex(uniformIndex: number): Color {
        return this.shaderData.getColor(uniformIndex);
    }

    /**
     * 设置Color
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setColorByIndex(uniformIndex: number, value: Color) {
        this.shaderData.setColor(uniformIndex, value);
    }

    /**
     * 获得Color
     * @param name 属性名称
     * @returns 
     */
    getColor(name: string): Color {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.shaderData.getColor(uniformIndex);
    }

    /**
     * 设置Color
     * @param name 属性名称
     * @param value 值
     */
    setColor(name: string, value: Color) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setColorByIndex(uniformIndex, value);
    }

    /**
     * 获得Matrix4x4
     * @param uniformIndex 属性索引
     * @returns 
     */
    getMatrix4x4ByIndex(uniformIndex: number): Matrix4x4 {
        return this.shaderData.getMatrix4x4(uniformIndex);
    }

    /**
     * 设置Matrix4x4
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setMatrix4x4ByIndex(uniformIndex: number, value: Matrix4x4) {
        this.shaderData.setMatrix4x4(uniformIndex, value);
    }

    /**
     * 获得Matrix4x4
     * @param name 属性名称
     * @returns 
     */
    getMatrix4x4(name: string): Matrix4x4 {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getMatrix4x4ByIndex(uniformIndex);
    }

    /**
     * 设置Matrix4x4
     * @param name 属性名称
     * @param value 值
     */
    setMatrix4x4(name: string, value: Matrix4x4) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setMatrix4x4ByIndex(uniformIndex, value);
    }

    /**
     * 设置纹理
     * @param uniformIndex 属性索引
     * @param texture 
     */
    setTextureByIndex(uniformIndex: number, texture: BaseTexture) {
        this.shaderData.setTexture(uniformIndex, texture);
        if (texture && !texture._texture)//贴图为加载完，需要重设
            texture.once(Event.READY, this, this.reSetTexture);
    }

    private reSetTexture(texture: BaseTexture) {
        let index = this.shaderData.getSourceIndex(texture);
        if (index != -1) {
            this.setTextureByIndex(index, texture);
        }
    }

    /**
     * 获得纹理
     * @param uniformIndex 属性索引
     * @returns 
     */
    getTextureByIndex(uniformIndex: number) {
        return this.shaderData.getTexture(uniformIndex);
    }

    /**
     * 设置纹理
     * @param name 属性名称
     * @param texture 
     */
    setTexture(name: string, texture: BaseTexture) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setTextureByIndex(uniformIndex, texture);
    }

    /**
     * 获得纹理
     * @param name 属性名称
     * @returns 
     */
    getTexture(name: string): BaseTexture {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getTextureByIndex(uniformIndex);
    }

    /**
     * 获得Buffer
     * @param uniformIndex 属性索引
     * @returns 
     */
    getBufferByIndex(uniformIndex: number): Float32Array {
        return this.shaderData.getBuffer(uniformIndex);
    }

    /**
     * 设置Buffer
     * @param uniformIndex 属性索引
     * @param value 值
     */
    setBufferByIndex(uniformIndex: number, value: Float32Array) {
        this.shaderData.setBuffer(uniformIndex, value);
    }

    /**
     * 获得Buffer
     * @param name 属性名称
     * @returns 
     */
    getBuffer(name: string): Float32Array {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getBufferByIndex(uniformIndex);
    }

    /**
     * 设置Buffer
     * @param name 属性名称
     * @param value 值
     */
    setBuffer(name: string, value: Float32Array) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setBufferByIndex(uniformIndex, value);
    }

    /**
     * 设置ShaderData的属性值
     * @param uniformIndex 属性索引
     * @param type 值类型
     * @param value 值
     */
    setShaderDataByIndex(uniformIndex: number, type: ShaderDataType, value: ShaderDataItem) {
        this.shaderData.setShaderData(uniformIndex, type, value);
    }

    /**
     * 设置ShaderData的属性值
     * @param name 属性名称
     * @param type 值类型
     * @param value 值
     */
    setShaderData(name: string, type: ShaderDataType, value: ShaderDataItem) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setShaderDataByIndex(uniformIndex, type, value);
    }

    /**
     * 获得ShaderData的属性值
     * @param name 属性名称
     * @param type 值类型
     * @returns 
     */
    getShaderData(name: string, type: ShaderDataType): ShaderDataItem {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getShaderDataByIndex(uniformIndex, type);
    }

    /**
     * 获得ShaderData的属性值
     * @param uniformIndex 属性索引
     * @param type 值类型
     * @returns 
     */
    getShaderDataByIndex(uniformIndex: number, type: ShaderDataType): ShaderDataItem {
        return this._shaderValues.getShaderData(uniformIndex, type);
    }

    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        var destBaseMaterial: Material = (<Material>destObject);
        destBaseMaterial.name = this.name;
        destBaseMaterial.renderQueue = this.renderQueue;
        destBaseMaterial.setShaderName(this._shader._name);
        this._shaderValues.cloneTo(destBaseMaterial._shaderValues);
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: Material = new Material();
        this.cloneTo(dest);
        return dest;
    }

    //--------------------------------------------兼容-------------------------------------------------
    /**
     * 设置属性值
     * @deprecated
     * @param name 
     * @param value 
     */
    setShaderPropertyValue(name: string, value: any) {
        let propertyID = Shader3D.propertyNameToID(name);
        this.shaderData.setValueData(propertyID, value);
    }

    /**
     * 获取属性值
     * @deprecated
     * @param name 
     */
    getShaderPropertyValue(name: string): any {
        return this.shaderData.getValueData(Shader3D.propertyNameToID(name));
    }

    get _defineDatas(): DefineDatas {
        return this._shaderValues._defineDatas;
    }

    /**
     * override it
     */
    oldparseEndEvent() {
        //TODO
    }
}


