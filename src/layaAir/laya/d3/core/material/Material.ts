import { Loader } from "../../../net/Loader";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { Handler } from "../../../utils/Handler";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataDefaultValue, ShaderDataItem, ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { IClone } from "../../../utils/IClone";
import { LayaGL } from "../../../layagl/LayaGL";
import { Config3D } from "../../../../Config3D";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { RenderState } from "./RenderState";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Color } from "../../math/Color";
import { ILaya } from "../../../../ILaya";
import { CullMode } from "../../../RenderEngine/RenderEnum/CullMode";

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
    RENDERMODE_ALPHABLENDED
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
    /**@internal */
    static CULL: number;
    /**@internal */
    static BLEND: number;
    /**@internal */
    static BLEND_SRC: number;
    /**@internal */
    static BLEND_DST: number;
    /**@internal */
    static DEPTH_TEST: number;
    /**@internal */
    static DEPTH_WRITE: number;
    /**@internal */
    static STENCIL_TEST: number;
    /**@internal */
    static STENCIL_WRITE: number;
    /**@internal */
    static STENCIL_Ref: number;
    /**@internal */
    static STENCIL_Op: number;

    /**@internal */


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
        Material.CULL = Shader3D.propertyNameToID("s_Cull");
        Material.BLEND = Shader3D.propertyNameToID("s_Blend");
        Material.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
        Material.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
        Material.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
        Material.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
        Material.STENCIL_TEST = Shader3D.propertyNameToID("s_StencilTest");
        Material.STENCIL_WRITE = Shader3D.propertyNameToID("s_StencilWrite");
        Material.STENCIL_Ref = Shader3D.propertyNameToID("s_StencilRef");
        Material.STENCIL_Op = Shader3D.propertyNameToID("s_StencilOp");
    }

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
        return this._shaderValues.getBool(Material.DEPTH_WRITE);
    }

    set depthWrite(value: boolean) {
        this._shaderValues.setBool(Material.DEPTH_WRITE, value);
    }


    /**
     * 剔除方式。
     */
    get cull(): number {
        return this._shaderValues.getInt(Material.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(Material.CULL, value);
    }

    /**
     * 混合方式。
     */
    get blend(): number {
        return this._shaderValues.getInt(Material.BLEND);
    }

    set blend(value: number) {
        this._shaderValues.setInt(Material.BLEND, value);
    }


    /**
     * 混合源。
     */
    get blendSrc(): number {
        return this._shaderValues.getInt(Material.BLEND_SRC);
    }

    set blendSrc(value: number) {
        this._shaderValues.setInt(Material.BLEND_SRC, value);
    }



    /**
     * 混合目标。
     */
    get blendDst(): number {
        return this._shaderValues.getInt(Material.BLEND_DST);
    }

    set blendDst(value: number) {
        this._shaderValues.setInt(Material.BLEND_DST, value);
    }

    /**
     * 深度测试方式。
     */
    get depthTest(): number {
        return this._shaderValues.getInt(Material.DEPTH_TEST);
    }

    set depthTest(value: number) {
        this._shaderValues.setInt(Material.DEPTH_TEST, value);
    }

    /**
     * 模板测试方式
     */
    get stencilTest(): number {
        return this._shaderValues.getInt(Material.STENCIL_TEST);
    }

    set stencilTest(value: number) {
        this._shaderValues.setInt(Material.STENCIL_TEST, value);
    }

    /**
     * 是否写入模板。
     */
    get stencilWrite(): boolean {
        return this._shaderValues.getBool(Material.STENCIL_WRITE);
    }

    set stencilWrite(value: boolean) {
        this._shaderValues.setBool(Material.STENCIL_WRITE, value);
    }

    /**
     * 写入模板值
     */
    set stencilRef(value: number) {
        this._shaderValues.setInt(Material.STENCIL_Ref, value);
    }

    get stencilRef(): number {
        return this._shaderValues.getInt(Material.STENCIL_Ref);
    }

    /** */
    /**
     * 写入模板测试设置
     * vector(fail, zfail, zpass)
     */
    set stencilOp(value: Vector3) {
        this._shaderValues.setVector3(Material.STENCIL_Op, value);
    }

    get stencilOp(): Vector3 {
        return this._shaderValues.getVector3(Material.STENCIL_Op);
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
            default:
                throw new Error("UnlitMaterial : renderMode value error.");
        }
    }

    /**
     * 创建一个 <code>Material</code> 实例。
     */
    constructor() {
        super();
        this._shaderValues = LayaGL.renderOBJCreate.createShaderData(this);
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;
        this.alphaTest = false;
        this.cull = CullMode.Back;
        this.destoryedImmediately = false;
    }

    //根据绑定的shader 缓存一些特殊的数据
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
            //ubo.setDataByUniformBufferData(uboData);
            this._shaderValues.setUniformBuffer(Shader3D.propertyNameToID(key), ubo);
            this._shaderValues._addCheckUBO(key, ubo, uboData);
            // this._shaderValues.uniformBufferDatas.set(key, ubo);

            // uboData._uniformParamsState.forEach((value: UniformBufferParamsType, id: number) => {
            //     this._shaderValues.uniformBuffersMap.set(id, ubo);
            // });
        }


    }

    /**
     * 清除UBO
     * @returns 
     */
    private _releaseUBOData() {
        if (!this._shaderValues.uniformBufferDatas) {
            return;
        }
        for (let value of this._shaderValues.uniformBufferDatas.values()) {
            value._updateDataInfo.destroy();
            value.destroy();
            value._updateDataInfo = null;
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


    //
    /**
     *get all material uniform property 
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

    getBoolByIndex(uniformIndex: number): boolean {
        return this.shaderData.getBool(uniformIndex);
    }

    setBoolByIndex(uniformIndex: number, value: boolean) {
        this.shaderData.setBool(uniformIndex, value);
    }

    getBool(name: string): boolean {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getBoolByIndex(uniformIndex);
    }

    setBool(name: string, value: boolean) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setBoolByIndex(uniformIndex, value);
    }

    getFloatByIndex(uniformIndex: number): number {
        return this.shaderData.getNumber(uniformIndex);
    }

    setFloatByIndex(uniformIndex: number, value: number) {
        this.shaderData.setNumber(uniformIndex, value);
    }

    getFloat(name: string): number {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getFloatByIndex(uniformIndex);
    }

    setFloat(name: string, value: number) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setFloatByIndex(uniformIndex, value);
    }

    getIntByIndex(uniformIndex: number): number {
        return this.shaderData.getInt(uniformIndex);
    }

    setIntByIndex(uniformIndex: number, value: number) {
        this.shaderData.setInt(uniformIndex, value);
    }

    getInt(name: string): number {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getIntByIndex(uniformIndex);
    }

    setInt(name: string, value: number) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setIntByIndex(uniformIndex, value);
    }

    getVector2ByIndex(uniformIndex: number): Vector2 {
        return this.shaderData.getVector2(uniformIndex);
    }

    setVector2ByIndex(uniformIndex: number, value: Vector2) {
        this.shaderData.setVector2(uniformIndex, value);
    }

    getVector2(name: string): Vector2 {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector2ByIndex(uniformIndex);
    }

    setVector2(name: string, value: Vector2) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector2ByIndex(uniformIndex, value);
    }


    getVector3ByIndex(uniformIndex: number): Vector3 {
        return this.shaderData.getVector3(uniformIndex);
    }

    setVector3ByIndex(uniformIndex: number, value: Vector3) {
        this.shaderData.setVector3(uniformIndex, value);
    }

    getVector3(name: string) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector3ByIndex(uniformIndex);
    }

    setVector3(name: string, value: Vector3) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector3ByIndex(uniformIndex, value);
    }

    setVector4ByIndex(uniformIndex: number, value: Vector4) {
        this.shaderData.setVector(uniformIndex, value);
    }

    getVector4ByIndex(uniformIndex: number): Vector4 {
        return this.shaderData.getVector(uniformIndex);
    }

    setVector4(name: string, value: Vector4) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector4ByIndex(uniformIndex, value);
    }

    getVector4(name: string) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector4ByIndex(uniformIndex);
    }

    getColorByIndex(uniformIndex: number): Color {
        return this.shaderData.getColor(uniformIndex);
    }

    setColorByIndex(uniformIndex: number, value: Color) {
        this.shaderData.setColor(uniformIndex, value);
    }

    getColor(name: string): Color {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.shaderData.getColor(uniformIndex);
    }

    setColor(name: string, value: Color) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setColorByIndex(uniformIndex, value);
    }

    getMatrix4x4ByIndex(uniformIndex: number): Matrix4x4 {
        return this.shaderData.getMatrix4x4(uniformIndex);
    }

    setMatrix4x4ByIndex(uniformIndex: number, value: Matrix4x4) {
        this.shaderData.setMatrix4x4(uniformIndex, value);
    }

    getMatrix4x4(name: string): Matrix4x4 {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getMatrix4x4ByIndex(uniformIndex);
    }

    setMatrix4x4(name: string, value: Matrix4x4) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setMatrix4x4ByIndex(uniformIndex, value);
    }

    setTextureByIndex(uniformIndex: number, texture: BaseTexture) {
        this.shaderData.setTexture(uniformIndex, texture);
    }

    getTextureByIndex(uniformIndex: number) {
        return this.shaderData.getTexture(uniformIndex);
    }

    setTexture(name: string, texture: BaseTexture) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setTextureByIndex(uniformIndex, texture);
    }

    getTexture(name: string): BaseTexture {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getTextureByIndex(uniformIndex);
    }

    getBufferByIndex(uniformIndex: number): Float32Array {
        return this.shaderData.getBuffer(uniformIndex);
    }

    setBufferByIndex(uniformIndex: number, value: Float32Array) {
        this.shaderData.setBuffer(uniformIndex, value);
    }

    getBuffer(name: string): Float32Array {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getBufferByIndex(uniformIndex);
    }

    setBuffer(name: string, value: Float32Array) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setBufferByIndex(uniformIndex, value);
    }

    setShaderDataByIndex(uniformIndex: number, type: ShaderDataType, value: ShaderDataItem) {
        this.shaderData.setShaderData(uniformIndex, type, value);
    }

    setShaderData(name: string, type: ShaderDataType, value: ShaderDataItem) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setShaderDataByIndex(uniformIndex, type, value);
    }

    getShaderData(name: string, type: ShaderDataType): ShaderDataItem {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getShaderDataByIndex(uniformIndex, type);
    }

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

    oldparseEndEvent(){
        //TODO
    }

    
}


