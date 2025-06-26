import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Resource } from "../../../resource/Resource";
import { Stat } from "../../../utils/Stat";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { isUboBufferShaderType, ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUDeviceBuffer } from "./compute/WebGPUStorageBuffer";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { DepthStencilParam, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache as string } from "./WebGPURenderPipelineHelper";
import { WebGPUSubUniformBuffer } from "./WebGPUUniform/WebGPUSubUniformBuffer";
import { WebGPUUniformBuffer } from "./WebGPUUniform/WebGPUUniformBuffer";
import { WebGPUUniformBufferBase } from "./WebGPUUniform/WebGPUUniformBufferBase";

/**
 * 着色器数据
 */
export class WebGPUShaderData extends ShaderData {
    private static pointerCount: number = 0;
    /**
     * 全局初始化
     */
    static __init__() {
        Material.__initDefine__();
    }
    /**
    * 帧结束时做一些处理
    */
    static endFrame() {

    }

    private _gammaColorMap: Map<number, Color>; //颜色矫正数据
    /**@internal */
    _data: any; //数据对象
    /**@internal */
    _defineDatas: WebDefineDatas; //宏定义对象

    /**@internal UBO Buffer Module*/
    _uniformBuffers: Map<string, WebGPUUniformBuffer>;
    /**@internal */
    _subUniformBuffers: Map<string, WebGPUSubUniformBuffer>;
    /**@internal */
    _uniformBuffersPropertyMap: Map<number, WebGPUUniformBufferBase>;
    /**@internal */
    // _updateCacheArray: Map<number, Function> = new Map();;

    _id: number = WebGPUShaderData.pointerCount++;
    private _subUboBufferNumber: number = 0;

    private _textureStatesMap: Map<string, number> = new Map();

    /** @internal */
    get textureStatesMap(): ReadonlyMap<string, number> {
        return this._textureStatesMap;
    }

    _textureData: { [key: number]: BaseTexture } = {};


    /// blend cache
    private _needUpdateBlendStateCache: boolean = false;

    private _blendStateCache: WebGPUBlendStateCache;

    public get blendStateCache(): WebGPUBlendStateCache {
        if (this._needUpdateBlendStateCache) {
            this.updateBlendStateCache();
        }
        return this._blendStateCache;
    }

    private updateBlendStateCache() {
        this._needUpdateBlendStateCache = false;

        const blend = this._data[Shader3D.BLEND] ?? RenderState.Default.blend;
        switch (blend) {
            case RenderState.BLEND_DISABLE:
                this._blendStateCache = WebGPUBlendState.getBlendState(blend, RenderState.BLENDEQUATION_ADD, RenderState.BLENDPARAM_ONE, RenderState.BLENDPARAM_ZERO, RenderState.BLENDEQUATION_ADD, RenderState.BLENDPARAM_ONE, RenderState.BLENDPARAM_ZERO,);
                break;
            case RenderState.BLEND_ENABLE_ALL:
                let blendEquation: any = this._data[Shader3D.BLEND_EQUATION];
                blendEquation = blendEquation ?? RenderState.Default.blendEquation;
                let srcBlend: any = this._data[Shader3D.BLEND_SRC];
                srcBlend = srcBlend ?? RenderState.Default.srcBlend;
                let dstBlend: any = this._data[Shader3D.BLEND_DST];
                dstBlend = dstBlend ?? RenderState.Default.dstBlend;
                this._blendStateCache = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                let blendEquationRGB: any = this._data[Shader3D.BLEND_EQUATION_RGB];
                blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;
                let blendEquationAlpha: any = this._data[Shader3D.BLEND_EQUATION_ALPHA];
                blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;
                let srcRGB: any = this._data[Shader3D.BLEND_SRC_RGB];
                srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;
                let dstRGB: any = this._data[Shader3D.BLEND_DST_RGB];
                dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;
                let srcAlpha: any = this._data[Shader3D.BLEND_SRC_ALPHA];
                srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;
                let dstAlpha: any = this._data[Shader3D.BLEND_DST_ALPHA];
                dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;
                this._blendStateCache = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
            default:
                break;
        }
    }

    /// depht stencil cache
    private _needUpdateDepthStencilStateCache: boolean = false;

    private _depthStencilParam: DepthStencilParam = new DepthStencilParam();

    private _depthStencilStateKey: string;
    public get depthStencilStateKey(): string {
        if (this._needUpdateDepthStencilStateCache) {
            this.updateDepthStencilStateCache();
        }
        return this._depthStencilStateKey;
    }
    public set depthStencilStateKey(value: string) {
        this._depthStencilStateKey = value;
    }

    private updateDepthStencilStateCache() {
        this._needUpdateDepthStencilStateCache = false;

        const data = this._data;
        let depthStencilParam = this._depthStencilParam;

        const depthWrite = data[Shader3D.DEPTH_WRITE] ?? RenderState.Default.depthWrite;
        const depthTest = data[Shader3D.DEPTH_TEST] ?? RenderState.Default.depthTest;

        let depthBias = data[Shader3D.DEPTH_BIAS] ?? RenderState.Default.depthBias;
        let depthBiasConstant = data[Shader3D.DEPTH_BIAS_CONSTANT] ?? RenderState.Default.depthBiasConstant;
        let depthBiasSlopeScale = data[Shader3D.DEPTH_BIAS_SLOPESCALE] ?? RenderState.Default.depthBiasSlopeScale;
        let depthBiasClamp = data[Shader3D.DEPTH_BIAS_CLAMP] ?? RenderState.Default.depthBiasClamp;

        depthStencilParam.depthWrite = depthWrite;
        depthStencilParam.depthTest = depthTest;
        depthStencilParam.depthBias = depthBias;
        depthStencilParam.depthBiasConstant = depthBiasConstant;
        depthStencilParam.depthBiasSlopeScale = depthBiasSlopeScale;
        depthStencilParam.depthBiasClamp = depthBiasClamp;

        // stencil
        let formatHasStencil = true;
        const stencilTest = data[Shader3D.STENCIL_TEST] ?? RenderState.Default.stencilTest;
        const stencilRef = data[Shader3D.STENCIL_Ref] ?? RenderState.Default.stencilRef;
        const stencilWrite = data[Shader3D.STENCIL_WRITE] ?? RenderState.Default.stencilWrite;
        const stencilOp = stencilWrite ? (data[Shader3D.STENCIL_Op] ?? RenderState.Default.stencilOp) : RenderState.Default.stencilOp;
        let stencilReadMask = data[Shader3D.STENCIL_READ_MASK] ?? RenderState.Default.stencilReadMask;
        let stencilWriteMask = stencilWrite ? (data[Shader3D.STENCIL_WRITE_MASK] ?? RenderState.Default.stencilWriteMask) : 0x00;

        depthStencilParam.stencilEnable = stencilTest !== RenderState.STENCILTEST_OFF && formatHasStencil;
        depthStencilParam.stencilTest = stencilTest;
        depthStencilParam.stencilRef = stencilRef;
        depthStencilParam.stencilWrite = stencilWrite;
        depthStencilParam.stencilOp = stencilOp;
        depthStencilParam.stencilReadMask = stencilReadMask;
        depthStencilParam.stencilWriteMask = stencilWriteMask;

        this._depthStencilStateKey = WebGPUDepthStencilState.getDepthStencilParamCacheID(depthStencilParam);
    }

    private _checkRenderState(index: number) {
        if (isBlendProperty(index)) {
            this._needUpdateBlendStateCache = true;
        }
        else if (isDepthStencilProperty(index)) {
            this._needUpdateDepthStencilStateCache = true;
        }
    }

    private _clearRenderStateCheck() {
        this._needUpdateBlendStateCache = false;
        this._needUpdateDepthStencilStateCache = false;
    }

    /**
     * 不允许直接创建，只能通过对象池
     * @param ownerResource 
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._data = {};
        this._gammaColorMap = new Map();
        this._defineDatas = new WebDefineDatas();

        this._uniformBuffers = new Map();
        this._subUniformBuffers = new Map();
        this._uniformBuffersPropertyMap = new Map();
    }

    private nearEqual(n1: number, n2: number): boolean {
        return Math.abs(n1 - n2) < Number.EPSILON
    }


    private _BindGroupFlagMap: Map<number, Set<Vector2>> = new Map();//通知bindGroup改动的map列表 key是mapID
    private _BindGroupLayoutFlagMap: Map<number, Set<Vector2>> = new Map();//通知bindGroup改动引起Layout改动的列表，key是mapID
    private _propertyLinkBindGroupMap: { [key: number]: number[] } = {};//每一个属性变化需要通知的BindGroupChangeFlag，key是propertyID

    //建立属性和BindGroup的联系
    addBindGroupChangeLink(commandMapID: string, uniformMap: Map<number, UniformProperty>) {
        let mapID = Shader3D.propertyNameToID(commandMapID);
        if (this._BindGroupFlagMap.has(mapID))
            return;
        this._BindGroupFlagMap.set(mapID, new Set());
        this._BindGroupLayoutFlagMap.set(mapID, new Set());

        //ubo bind
        let uboid = Shader3D.propertyNameToID(commandMapID);
        let notifyArray = this._propertyLinkBindGroupMap[uboid];
        if (!notifyArray)
            notifyArray = this._propertyLinkBindGroupMap[uboid] = [];
        notifyArray.push(mapID);
        //other propertyBind
        uniformMap.forEach((uniform, index) => {
            if (!isUboBufferShaderType(uniform.uniformtype)) {
                let notifyArray = this._propertyLinkBindGroupMap[uniform.id];
                if (!notifyArray)
                    notifyArray = this._propertyLinkBindGroupMap[uniform.id] = [];
                notifyArray.push(mapID);
            }
        });

    }

    //删除属性和BindGroup的联系
    removeBindGroupChangeLink(commandMapID: string, uniformMap: Map<number, UniformProperty>) {
        let mapID = Shader3D.propertyNameToID(commandMapID);
        if (!this._BindGroupFlagMap.has(mapID))
            return;
        this._BindGroupFlagMap.delete(mapID);
        this._BindGroupLayoutFlagMap.delete(mapID)
        let uboid = Shader3D.propertyNameToID(commandMapID);
        let notifyArray = this._propertyLinkBindGroupMap[uboid];
        if (notifyArray) {
            let pos = notifyArray.indexOf(mapID);
            notifyArray.splice(pos, 1);
        }
        //other propertyBind
        uniformMap.forEach((uniform, index) => {
            if (!isUboBufferShaderType(uniform.uniformtype)) {
                let notifyArray = this._propertyLinkBindGroupMap[uniform.id];
                if (notifyArray) {
                    let pos = notifyArray.indexOf(mapID);
                    notifyArray.splice(pos, 1);
                }
            }
        });

    }

    //增加BindGroup的标记更新
    addBindGroupChangeFlag(commandMapID: string, flag: Vector2, layoutFlag: Vector2) {
        let mapID = Shader3D.propertyNameToID(commandMapID);
        if (this._BindGroupFlagMap.has(mapID)) {
            let setBindgroup = this._BindGroupFlagMap.get(mapID);
            if (!setBindgroup.has(flag)) {
                flag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
                setBindgroup.add(flag);
            }

            let setlayout = this._BindGroupLayoutFlagMap.get(mapID);
            if (!setlayout.has(layoutFlag)) {
                layoutFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
                setlayout.add(layoutFlag);
            }


        }
    }

    //删除BindGroup的标记更新
    removeBindGroupChangeFlag(commandMapID: string, flag: Vector2, layoutFlag: Vector2) {
        let mapID = Shader3D.propertyNameToID(commandMapID);
        if (this._BindGroupFlagMap.has(mapID)) {
            this._BindGroupFlagMap.get(mapID).delete(flag);
            this._BindGroupLayoutFlagMap.get(mapID).delete(layoutFlag);
        }
    }

    private _initBufferData(uniformBuffer: WebGPUUniformBufferBase, name: string, uniformMap: Map<number, UniformProperty>) {
        this._textureStatesMap.set(name, 0);

        let valueMap = new Map<number, number>();

        if (uniformBuffer.descriptor.byteLength > 0) {
            // has buffer
            valueMap.set(Shader3D.propertyNameToID(name), uniformBuffer.globalId);
        }

        uniformMap.forEach(uniform => {
            let uniformId = uniform.id;
            let data = this._data[uniformId];
            if (data != null) {
                uniformBuffer.setUniformData(uniformId, uniform.uniformtype, data);
            }
            this._uniformBuffersPropertyMap.set(uniformId, uniformBuffer);

            this._updateTextureState(uniformId, name, data as WebGPUInternalTex);
        });
    }

    createUniformBuffer(name: string, uniformMap: WebGPUCommandUniformMap): WebGPUUniformBuffer {
        if (this._uniformBuffers.has(name)) {
            return this._uniformBuffers.get(name);
        }
        let uboBuffer = new WebGPUUniformBuffer(name, uniformMap._idata);
        this._uniformBuffers.set(name, uboBuffer);
        let id = Shader3D.propertyNameToID(name);
        this._data[id] = uboBuffer;
        this._initBufferData(uboBuffer, name, uniformMap._idata);
        return uboBuffer;
    }

    /** @internal */
    _cacheSubUniformBuffer(buffer: WebGPUSubUniformBuffer, name: string, cacheName: string, uniformMap: Map<number, UniformProperty>) {
        let subBuffer = this._subUniformBuffers.get(cacheName);
        if (!subBuffer || buffer != subBuffer) {
            if (!subBuffer) {
                this._subUboBufferNumber++;
            }
            buffer.notifyGPUBufferChange();

            this._subUniformBuffers.set(cacheName, buffer);
            this._textureStatesMap.set(cacheName, 0);

            let id = Shader3D.propertyNameToID(name);
            this._data[id] = buffer;

            uniformMap.forEach(uniform => {
                let uniformId = uniform.id;
                this._uniformBuffersPropertyMap.set(uniformId, buffer);
            });
        }
    }

    createSubUniformBuffer(name: string, cacheName: string, uniformMap: Map<number, UniformProperty>): WebGPUSubUniformBuffer {
        let subBuffer = this._subUniformBuffers.get(cacheName);
        if (subBuffer) {
            return subBuffer;
        }

        //create WebGPUSubUniform
        let uniformBuffer = new WebGPUSubUniformBuffer(cacheName, uniformMap, this);
        if (uniformBuffer.bytelength == 0) {
            return null;
        }
        this._subUboBufferNumber++;
        uniformBuffer.notifyGPUBufferChange();
        this._subUniformBuffers.set(cacheName, uniformBuffer);

        let id = Shader3D.propertyNameToID(name);
        this._data[id] = uniformBuffer;

        this._initBufferData(uniformBuffer, cacheName, uniformMap);
        return uniformBuffer;
    }

    /**
     * 获取数据对象
     */
    getData() {
        return this._data;
    }

    /**
     * 获取宏定义数据
     */
    getDefineData() {
        return this._defineDatas;
    }

    /**
     * @ignore
     */
    addDefine(define: ShaderDefine) {
        this._defineDatas.add(define);
    }

    /**
     * @ignore
     */
    addDefines(define: WebDefineDatas) {
        this._defineDatas.addDefineDatas(define);
    }

    /**
     * @ignore
     */
    removeDefine(define: ShaderDefine): void {
        this._defineDatas.remove(define);
    }

    removeDefines(defines: WebDefineDatas): void {
        this._defineDatas.removeDefineDatas(defines);
    }

    /**
     * @ignore
     */
    hasDefine(define: ShaderDefine) {
        return this._defineDatas.has(define);
    }

    /**
     * @ignore
     */
    clearDefine() {
        this._defineDatas.clear();
    }

    /**
     * 获取布尔
     * @param index shader索引
     * @return 布尔
     */
    getBool(index: number): boolean {
        return this._data[index];
    }

    /**
     * 设置布尔
     * @param index shader索引
     * @param value 布尔
     */
    setBool(index: number, value: boolean) {
        if (this._data[index] === value) return;
        this._data[index] = value;
    }

    /**
     * 获取整型
     * @param index shader索引
     * @return 整型
     */
    getInt(index: number): number {
        return this._data[index];
    }

    /**
     * 设置整型
     * @param index shader索引
     * @param value 整型
     */
    setInt(index: number, value: number) {
        if (this._data[index] === value) return;
        this._data[index] = value;

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setInt(index, value);
        }

        this._checkRenderState(index);
    }

    /**
     * 获取浮点
     * @param index shader索引
     * @return 浮点
     */
    getNumber(index: number): number {
        return this._data[index];
    }

    /**
     * 设置浮点
     * @param index shader索引
     * @param value 浮点
     */
    setNumber(index: number, value: number) {
        if (this.nearEqual(this._data[index], value)) return;
        this._data[index] = value;

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setFloat(index, value);
        }

        this._checkRenderState(index);
    }

    /**
     * 获取Vector2向量
     * @param index shader索引
     * @return Vector2向量
     */
    getVector2(index: number): Vector2 {
        return this._data[index];
    }

    /**
     * 设置Vector2向量
     * @param index shader索引
     * @param value Vector2向量
     */
    setVector2(index: number, value: Vector2) {
        if (this._data[index]) {
            if (Vector2.equals(this._data[index], value)) return;
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setVector2(index, value);
        }
    }

    /**
     * 获取Vector3向量
     * @param index shader索引
     * @return Vector3向量
     */
    getVector3(index: number): Vector3 {
        return this._data[index];
    }

    /**
     * 设置Vector3向量
     * @param index shader索引
     * @param value Vector3向量
     */
    setVector3(index: number, value: Vector3) {
        if (this._data[index]) {
            if (Vector3.equals(this._data[index], value)) return;
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setVector3(index, value);
        }
    }

    /**
     * 获取向量
     * @param index shader索引
     * @return 向量
     */
    getVector(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 设置向量
     * @param index shader索引
     * @param value 向量
     */
    setVector(index: number, value: Vector4) {
        if (this._data[index]) {
            if (Vector4.equals(this._data[index], value)) return;
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setVector4(index, value);
        }
    }

    /**
     * 获取颜色
     * @param index 索引
     * @returns 颜色
     */
    getColor(index: number) {
        return this._gammaColorMap.get(index);
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color) {
        if (!value) return;
        if (this._data[index]) {
            let gammaColor = this._gammaColorMap.get(index);
            if (gammaColor.equal(value)) return;
            value.cloneTo(gammaColor);
            let linearColor = this._data[index];
            linearColor.x = Color.gammaToLinearSpace(value.r);
            linearColor.y = Color.gammaToLinearSpace(value.g);
            linearColor.z = Color.gammaToLinearSpace(value.b);
            linearColor.w = value.a;
        }
        else {
            let linearColor = new Vector4();
            linearColor.x = Color.gammaToLinearSpace(value.r);
            linearColor.y = Color.gammaToLinearSpace(value.g);
            linearColor.z = Color.gammaToLinearSpace(value.b);
            linearColor.w = value.a;
            this._data[index] = linearColor;
            this._gammaColorMap.set(index, value.clone());
        }

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            let color = this._data[index] as Vector4;
            buffer.setVector4(index, color);
        }
    }

    /**
     * @internal
     * @param index 
     */
    getLinearColor(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 获取矩阵
     * @param index 
     * @returns 
     */
    getMatrix3x3(index: number): Matrix3x3 {
        return this._data[index];
    }

    /**
     * 设置矩阵
     * @param index 
     * @param value 
     */
    setMatrix3x3(index: number, value: Matrix3x3) {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        }
        else {
            this._data[index] = value.clone();
        }

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setMatrix3x3(index, value);
        }
    }

    /**
     * 获取矩阵
     * @param index shader索引
     * @return 矩阵
     */
    getMatrix4x4(index: number): Matrix4x4 {
        return this._data[index];
    }

    /**
     * 设置矩阵
     * @param index shader索引
     * @param value 矩阵
     */
    setMatrix4x4(index: number, value: Matrix4x4) {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else {
            this._data[index] = value.clone();
        }

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setMatrix4x4(index, value);
        }
    }

    /**
     * 获取Buffer
     * @param index shader索引
     * @return
     */
    getBuffer(index: number): Float32Array {
        return this._data[index];
    }

    /**
     * 设置Buffer
     * @param index shader索引
     * @param value buffer数据
     */
    setBuffer(index: number, value: Float32Array) {
        this._data[index] = value;

        if (this._uniformBuffersPropertyMap.has(index)) {
            let buffer = this._uniformBuffersPropertyMap.get(index);
            buffer.setBuffer(index, value);
        }
    }

    /**
     * 设置纹理
     * @param index shader索引
     * @param value 纹理
     */
    setTexture(index: number, value: BaseTexture) {
        var lastValue: BaseTexture = this._textureData[index];

        if (value && (value as any).bitmap) value = (value as any).bitmap;
        //维护Reference
        this._textureData[index] = value;
        if (value) {
            this._setInternalTexture(index, (value._texture as WebGPUInternalTex));
        } else {
            this._setInternalTexture(index, null);
        }
        lastValue && lastValue._removeReference();
        value && value._addReference();
    }

    private _updateTextureState(index: number, mapName: string, value: WebGPUInternalTex) {
        if (this._textureStatesMap.has(mapName)) {
            let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(mapName) as WebGPUCommandUniformMap;
            if (!map._textureBits.has(index)) {
                return;
            }

            value = value || map._defaultData.get(index)?._texture as WebGPUInternalTex;

            let textureBit = map._textureBits.get(index);
            let stateMask = this._textureStatesMap.get(mapName);

            let sampler: GPUSamplerBindingLayout = { type: "filtering" };
            if (value) {
                let tex = value as WebGPUInternalTex;
                tex._getSampleBindingLayout(sampler);
            }
            if (sampler.type != "filtering") {
                stateMask = stateMask | (1 << textureBit);
            }
            else {
                stateMask = stateMask & ~(1 << textureBit);
            }

            this._textureStatesMap.set(mapName, stateMask);
        }
    }

    /**
     * 设置内部纹理
     * @param index shader索引
     * @param value 纹理
     */
    _setInternalTexture(index: number, value: InternalTexture) {
        const lastValue = this._data[index];
        if (lastValue != value) {
            if (value) {
                const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
                if (shaderDefine) {
                    if (value.gammaCorrection > 1)
                        this.addDefine(shaderDefine);
                    else this.removeDefine(shaderDefine);
                }
            }
            this._data[index] = value;

            //update Bindgroup flag
            let bindgroupMap = this._propertyLinkBindGroupMap[index];
            if (bindgroupMap && bindgroupMap.length > 0) {
                for (var i = 0; i < bindgroupMap.length; i++) {
                    let bidngroupMap = this._BindGroupFlagMap.get(bindgroupMap[i])
                    bidngroupMap.forEach(value => {
                        value.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
                    });
                }
            }
            //update BindGroupLayout flag

            let buffer = this._uniformBuffersPropertyMap.get(index);
            if (buffer) {
                let name = buffer.descriptor.lable;
                this._updateTextureState(index, name, value as WebGPUInternalTex);
            }
        }
    }

    setDeviceBuffer(index: number, value: WebGPUDeviceBuffer): void {
        let lastBuffer = this._data[index] as WebGPUDeviceBuffer;
        if (this._data[index] != value) {
            if (lastBuffer) {
                lastBuffer._removeCacheShaderData(this);
            }
            this._data[index] = value;
            if (value) {
                value._addCacheShaderData(this, index);
            }
            let bindgroupMap = this._propertyLinkBindGroupMap[index];
            if (bindgroupMap && bindgroupMap.length > 0) {
                for (var i = 0; i < bindgroupMap.length; i++) {
                    let bidngroupMap = this._BindGroupFlagMap.get(bindgroupMap[i])
                    bidngroupMap.forEach(value => {
                        value.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
                    });
                }
            }
        }
    }

    /**
     * 获取纹理
     * @param index shader索引
     * @return 纹理
     */
    getTexture(index: number): BaseTexture {
        return this._textureData[index];
    }


    /**
     * 克隆（仅克隆数据）
     * @param dest 
     */
    cloneTo(dest: WebGPUShaderData) {
        dest.clearData();
        var destData: { [key: string]: number | boolean | Vector2 | Vector3 | Vector4 | Matrix3x3 | Matrix4x4 | Resource } = dest._data;

        for (var k in this._data) {//TODO:需要优化,杜绝is判断，慢
            var value: any = this._data[k];
            if (value != null) {
                if (typeof value == "number") {
                    destData[k] = value;
                } else if (typeof value == "boolean") {
                    destData[k] = value;
                } else if (value instanceof Vector2) {
                    let v2 = destData[k] || (destData[k] = new Vector2());
                    value.cloneTo(<Vector2>v2);
                } else if (value instanceof Vector3) {
                    let v3 = destData[k] || (destData[k] = new Vector3());
                    value.cloneTo(<Vector3>v3);
                } else if (value instanceof Vector4) {
                    let color = this.getColor(parseInt(k));
                    if (color) {
                        let clonecolor = color.clone();
                        dest.setColor(parseInt(k), clonecolor);
                    } else {
                        let v4 = destData[k] || (destData[k] = new Vector4());
                        value.cloneTo(<Vector4>v4);
                    }
                }
                else if (value instanceof Matrix3x3) {
                    let mat = destData[k] || (destData[k] = new Matrix3x3());
                    value.cloneTo(<Matrix3x3>mat);
                }
                else if (value instanceof Matrix4x4) {
                    let mat = destData[k] || (destData[k] = new Matrix4x4());
                    value.cloneTo(<Matrix4x4>mat);
                } else if (value instanceof Resource) {
                    destData[k] = value;
                    value._addReference();
                }
            }
        }
        this._defineDatas.cloneTo(dest._defineDatas);
        this._gammaColorMap.forEach((color, index) => {
            dest._gammaColorMap.set(index, color.clone());
        });

        for (let texInfo in this._textureData) {
            dest.setTexture(parseInt(texInfo), this._textureData[texInfo]);
        }
    }

    /**
     * 克隆（仅克隆数据）
     */
    clone() {
        const dest = new WebGPUShaderData();
        this.cloneTo(dest);
        return dest;
    }

    /**
     * 清理数据
     */
    clearData() {
        for (const index in this._data) {
            if (this._data[index] instanceof Resource)
                this._data[index]._removeReference();
            if (this._data[index] instanceof WebGPUDeviceBuffer)
                this._data[index]._removeCacheShaderData(this);
        }

        this._uniformBuffersPropertyMap.clear();

        this._uniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._uniformBuffers.clear();

        this._subUniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._subUniformBuffers.clear();

        this._data = {};
        this._gammaColorMap.clear();
        this.clearDefine();
        this._subUboBufferNumber = 0;

        this._textureStatesMap.clear();

        this._clearRenderStateCheck();
    }

    /**
     * 销毁转回收
     */
    destroy() {
        this.clearData();

        this._defineDatas.destroy();

        this._gammaColorMap.clear();
    }
}

function isBlendProperty(index: number) {
    return index == Shader3D.BLEND ||
        index == Shader3D.BLEND_SRC ||
        index == Shader3D.BLEND_DST ||
        index == Shader3D.BLEND_SRC_RGB ||
        index == Shader3D.BLEND_DST_RGB ||
        index == Shader3D.BLEND_SRC_ALPHA ||
        index == Shader3D.BLEND_DST_ALPHA ||
        index == Shader3D.BLEND_EQUATION ||
        index == Shader3D.BLEND_EQUATION_RGB ||
        index == Shader3D.BLEND_EQUATION_ALPHA;
}

function isDephtProperty(index: number) {
    return index == Shader3D.DEPTH_TEST ||
        index == Shader3D.DEPTH_WRITE ||
        index == Shader3D.DEPTH_BIAS ||
        index == Shader3D.DEPTH_BIAS_CONSTANT ||
        index == Shader3D.DEPTH_BIAS_SLOPESCALE ||
        index == Shader3D.DEPTH_BIAS_CLAMP;
}

function isStencilProperty(index: number) {
    return index == Shader3D.STENCIL_TEST ||
        index == Shader3D.STENCIL_WRITE ||
        index == Shader3D.STENCIL_WRITE_MASK ||
        index == Shader3D.STENCIL_READ_MASK ||
        index == Shader3D.STENCIL_Ref ||
        index == Shader3D.STENCIL_Op;
}

function isDepthStencilProperty(index: number) {
    return isDephtProperty(index) || isStencilProperty(index);
}