import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { WebGLEngine } from "../../WebGLDriver/RenderDevice/WebGLEngine";
import { isRenderStateProperty, ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../Design/ShaderDefine";
import { WebDefineDatas } from "./WebDefineDatas";
import { WebGLUniformBuffer } from "../../WebGLDriver/RenderDevice/WebGLUniformBuffer";
import { WebGLSubUniformBuffer } from "../../WebGLDriver/RenderDevice/WebGLSubUniformBuffer";
import { WebGLUniformBufferDescriptor } from "../../WebGLDriver/RenderDevice/WebGLUniformBufferDescriptor";
import { WebGLUniformBufferManager } from "../../WebGLDriver/RenderDevice/WebGLUniformBufferManager";
import { IWebGLUniformBuffer } from "../../WebGLDriver/RenderDevice/IWebGLUniformBuffer";
import { UniformBufferWriter } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferWriter";
import type { UniformBufferBlock } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferBlock";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Config } from "../../../../Config";
import { WebGLCommandUniformMap } from "../../WebGLDriver/RenderDevice/WebGLCommandUniformMap";
import { LayaGL } from "../../../layagl/LayaGL";
import { RenderState } from "../Design/RenderState";

/**
 * 着色器数据类。
 */
export class WebGLShaderData extends ShaderData {
    private static pointerCount: number = 0;
    /**@internal */
    protected _gammaColorMap: Map<number, Color>;
    /**@internal */
    _data: any = null;

    /** @internal */
    _defineDatas: WebDefineDatas = new WebDefineDatas();


    _id: number = WebGLShaderData.pointerCount++;

    /** @internal */
    private _uniformBuffers: Map<string, WebGLUniformBuffer>;

    /**
     * _uniformBuffers 恰好一个时缓存该元素,否则为 null。
     * 不变量:_singleUniformBuffer !== null ⟺ size === 1(靠 _uniformBuffers 只增不减成立)。
     */
    private _singleUniformBuffer: WebGLUniformBuffer = null;

    /** @internal */
    private _subUniformBuffers: Map<string, WebGLSubUniformBuffer>;

    /** @internal */
    private _uniformBuffersPropertyMap: Map<number, IWebGLUniformBuffer>;

    private _needCacheData: boolean = false;

    private _updateCacheArray: { [key: number]: Function } = null;

    /**
     * 持有 sub UBO 时缓存的 bufferMgr,只在 createSubUniformBuffer 里赋值;
     * 为 null 表示没有走 manager 的 UBO,setter 跳过挂载。
     */
    private _bufferMgr: WebGLUniformBufferManager = null;

    /** 挂入待 apply 列表时的 upload 轮次,与 mgr._uploadRound 比对去重。 */
    private _pendingRound: number = -1;

    private _renderStateChanged: boolean = true;

    /** @internal */
    public get renderStateChanged(): boolean {
        return this._renderStateChanged;
    }

    /** @internal */
    renderState: RenderState = new RenderState();

    /** @internal */
    updateRenderState() {
        this._renderStateChanged = false;

        const datas: any = this.getData();
        const renderState = this.renderState;

        // depth
        let depthWrite: boolean = datas[Shader3D.DEPTH_WRITE];
        depthWrite = depthWrite ?? RenderState.Default.depthWrite;
        renderState.depthWrite = depthWrite;

        let depthTest = datas[Shader3D.DEPTH_TEST];
        depthTest = depthTest ?? RenderState.Default.depthTest;
        renderState.depthTest = depthTest;

        //Stencil
        let stencilWrite: boolean = datas[Shader3D.STENCIL_WRITE];
        stencilWrite = stencilWrite ?? RenderState.Default.stencilWrite;
        renderState.stencilWrite = stencilWrite;

        let stencilWriteMask: number = (datas[Shader3D.STENCIL_WRITE_MASK] ?? RenderState.Default.stencilWriteMask);
        renderState.stencilWriteMask = stencilWriteMask;

        let stencilOp = datas[Shader3D.STENCIL_Op];
        stencilOp = stencilOp ?? RenderState.Default.stencilOp;
        renderState.stencilOp.set(stencilOp.x, stencilOp.y, stencilOp.z);

        let stencilTest = datas[Shader3D.STENCIL_TEST];
        stencilTest = stencilTest ?? RenderState.Default.stencilTest;
        renderState.stencilTest = stencilTest;

        let stencilReadMask = datas[Shader3D.STENCIL_READ_MASK] ?? RenderState.Default.stencilReadMask;
        renderState.stencilReadMask = stencilReadMask;

        var stencilRef = datas[Shader3D.STENCIL_Ref];
        stencilRef = stencilRef ?? RenderState.Default.stencilRef;
        renderState.stencilRef = stencilRef;

        // depth bias
        let depthBias = datas[Shader3D.DEPTH_BIAS] ?? RenderState.Default.depthBias;
        renderState.depthBias = depthBias;

        let depthBiasConstant = datas[Shader3D.DEPTH_BIAS_CONSTANT];
        depthBiasConstant = depthBiasConstant ?? RenderState.Default.depthBiasConstant;
        renderState.depthBiasConstant = depthBiasConstant;

        let depthBiasSlopeScale = datas[Shader3D.DEPTH_BIAS_SLOPESCALE];
        depthBiasSlopeScale = depthBiasSlopeScale ?? RenderState.Default.depthBiasSlopeScale;
        renderState.depthBiasSlopeScale = depthBiasSlopeScale;

        let depthBiasClamp = datas[Shader3D.DEPTH_BIAS_CLAMP];
        depthBiasClamp = depthBiasClamp ?? RenderState.Default.depthBiasClamp;
        renderState.depthBiasClamp = depthBiasClamp;

        //blend
        let blend = datas[Shader3D.BLEND];
        blend = blend ?? RenderState.Default.blend;
        renderState.blend = blend;

        let blendEquation = datas[Shader3D.BLEND_EQUATION];
        blendEquation = blendEquation ?? RenderState.Default.blendEquation;
        renderState.blendEquation = blendEquation;

        let srcBlend = datas[Shader3D.BLEND_SRC];
        srcBlend = srcBlend ?? RenderState.Default.srcBlend;
        renderState.srcBlend = srcBlend;

        let dstBlend = datas[Shader3D.BLEND_DST];
        dstBlend = dstBlend ?? RenderState.Default.dstBlend;
        renderState.dstBlend = dstBlend;

        let blendEquationRGB = datas[Shader3D.BLEND_EQUATION_RGB];
        blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;
        renderState.blendEquationRGB = blendEquationRGB;

        let blendEquationAlpha = datas[Shader3D.BLEND_EQUATION_ALPHA];
        blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;
        renderState.blendEquationAlpha = blendEquationAlpha;

        let srcRGB = datas[Shader3D.BLEND_SRC_RGB];
        srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;
        renderState.srcBlendRGB = srcRGB;

        let dstRGB = datas[Shader3D.BLEND_DST_RGB];
        dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;
        renderState.dstBlendRGB = dstRGB;

        let srcAlpha = datas[Shader3D.BLEND_SRC_ALPHA];
        srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;
        renderState.srcBlendAlpha = srcAlpha;

        let dstAlpha = datas[Shader3D.BLEND_DST_ALPHA];
        dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;
        renderState.dstBlendAlpha = dstAlpha;

        // cull
        let cull = datas[Shader3D.CULL];
        cull = cull ?? RenderState.Default.cull;
        renderState.cull = cull;

        // hash render state
        const engine = WebGLEngine.instance;

        const hash = engine.hashRenderState(renderState);
        renderState.hash = hash;

        this._renderStateChanged = false;
    }

    private _checkRenderState(index: number) {
        if (isRenderStateProperty(index)) {
            this._renderStateChanged = true;
        }
    }

    /**
     * @internal	
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._initData();
    }

    /**
     * @internal
     */
    _initData(): void {
        this._data = {};
        this._updateCacheArray = {};
        this._gammaColorMap = new Map();
        this._uniformBuffers = new Map();
        this._singleUniformBuffer = null;
        this._subUniformBuffers = new Map();
        this._uniformBuffersPropertyMap = new Map();
    }

    /**
     * @param name 
     * @param uniformMap 
     * @returns 
     */
    createUniformBuffer(name: string, uniformMap: Map<number, UniformProperty>, needUpdata: boolean = false): WebGLUniformBuffer {
        if (this._uniformBuffers.has(name)) {
            if (needUpdata) {
                this._updateUBOBuffer(name);
            }
            return this._uniformBuffers.get(name);
        }

        this._needCacheData = true;
        let uboBuffer = new WebGLUniformBuffer(name);

        uniformMap.forEach(uniform => {
            uboBuffer.addUniform(uniform.id, uniform.uniformtype, uniform.arrayLength);
        });
        uboBuffer.create();
        this._uniformBuffers.set(name, uboBuffer);
        //维护唯一元素缓存:恰好一个时缓存它,多个则置空
        this._singleUniformBuffer = this._uniformBuffers.size === 1 ? uboBuffer : null;
        let id = Shader3D.propertyNameToID(name);
        this._data[id] = uboBuffer;
        uniformMap.forEach(uniform => {
            let uniformId = uniform.id;
            let data = this._data[uniformId];
            if (data != null) {
                uboBuffer.setUniformData(uniformId, uniform.uniformtype, data);
            }
            this._uniformBuffersPropertyMap.set(uniformId, uboBuffer);
        });
        this._uboLayoutVersion++; //守全"属性映射一变就 bump"不变量(独立 UBO,句柄经 instanceof 过滤仍得 null 回退)

        uboBuffer.needUpload && uboBuffer.upload();

        return uboBuffer;
    }

    /** 把自己挂进 bufferMgr 待 apply 列表;本轮已挂或无 UBO 则直接返回。 */
    private _markPendingApply(): void {
        const mgr = this._bufferMgr;
        if (!mgr || this._pendingRound === mgr._uploadRound) return;
        this._pendingRound = mgr._uploadRound;
        mgr._pendingApply.add(this);
    }

    private _updateUBOBuffer(name: string): void {
        if (!Config._uniformBlock) {
            return;
        }
        let buffer = this._uniformBuffers.get(name) || this._subUniformBuffers.get(name);

        if (!buffer) {
            return;
        }

        for (var i in this._updateCacheArray) {
            let index = parseInt(i);
            let ubo = this._uniformBuffersPropertyMap.get(index);
            if (ubo) {
                (this._updateCacheArray[i] as Function).call(ubo, index, this._data[index]);
            }
        }
        this._updateCacheArray = {};
        buffer.needUpload && buffer.upload();
    }


    createSubUniformBuffer(name: string, cacheName: string, uniformMap: Map<number, UniformProperty>) {
        let subBuffer = this._subUniformBuffers.get(cacheName);
        if (subBuffer) {
            //已缓存:攒下的改动由 bufferMgr.upload() 统一 apply
            return subBuffer;
        }

        let engine = WebGLEngine.instance;
        let mgr = engine.bufferMgr;

        // 块即写入器:构造 descriptor 后向 cluster 申请块,返回值即块(自带 setXxx 视图)
        let descriptor = new WebGLUniformBufferDescriptor(name);
        uniformMap.forEach(uniform => {
            descriptor.addUniform(uniform.id, uniform.uniformtype, uniform.arrayLength);
        });
        descriptor.finish(mgr.byteAlign / 4);

        let uniformBuffer = mgr.getBlock(descriptor.byteLength, descriptor, this) as WebGLSubUniformBuffer;
        this._bufferMgr = mgr; //持有走 manager 的 UBO 后,setter 才需要挂待 apply 列表
        this._needCacheData = true;
        this._subUniformBuffers.set(cacheName, uniformBuffer);

        let id = Shader3D.propertyNameToID(name);
        this._data[id] = uniformBuffer;

        uniformMap.forEach(uniform => {
            let uniformId = uniform.id;
            let data = this._data[uniformId];
            if (data != null) {
                uniformBuffer.setUniformData(uniformId, uniform.uniformtype, data);
            }
            this._uniformBuffersPropertyMap.set(uniformId, uniformBuffer);
        });
        this._uboLayoutVersion++; //建块改变属性→块映射,令已缓存的 UniformBufferField 重解析
        return uniformBuffer;
    }

    /**
     * @internal
     * 取持有属性 index 的池化块;独立 UBO(WebGLUniformBuffer,非 cluster 块)返回 null。
     */
    _getUniformBlockByProperty(index: number): UniformBufferBlock {
        const buf = this._uniformBuffersPropertyMap.get(index);
        return buf instanceof WebGLSubUniformBuffer ? buf : null;
    }



    /**
     * 注意!!!!!! 不要获得data之后直接设置值，设置值请使用set函数
     * @internal
     */
    getData(): any {
        return this._data;
    }

    /**
     * @ignore
     */
    addDefine(define: ShaderDefine): void {
        this._defineDatas.add(define);
    }

    addDefines(define: WebDefineDatas): void {
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
    hasDefine(define: ShaderDefine): boolean {
        return this._defineDatas.has(define);
    }

    /**
     * @ignore
     */
    clearDefine(): void {
        this._defineDatas.clear();
    }

    clearData() {
        //置空后 setter 不再挂入待 apply 列表
        this._bufferMgr = null;
        //丢弃攒存改动,否则重建 UBO 后会用即将清空的 _data 写入 undefined
        this._updateCacheArray = {};

        for (const key in this._data) {
            if (this._data[key] instanceof Resource) {
                this._data[key]._removeReference();
            }
        }

        this._uniformBuffersPropertyMap.clear();
        this._uboLayoutVersion++; //块全销毁,令已缓存的 UniformBufferField 失效重解析(重解析得 null→回退 setXxx)

        this._uniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._uniformBuffers.clear();
        this._singleUniformBuffer = null;

        this._subUniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._subUniformBuffers.clear();

        this._data = {};
        this._gammaColorMap.clear();

        this.clearDefine();
        this._needCacheData = false;

        this.renderState.setNull();
    }



    /**
     * 获取布尔。
     * @param	index shader索引。
     * @return  布尔。
     */
    getBool(index: number): boolean {
        return this._data[index];
    }

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        this._data[index] = value;

        //let ubo = this._uniformBuffersPropertyMap.get(index);
        if (this._needCacheData) {
            // todo
            // ubo set bool
        }

        this._checkRenderState(index);
    }

    /**
     * 获取整形。
     * @param	index shader索引。
     * @return  整形。
     */
    getInt(index: number): number {
        return this._data[index];
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        this._data[index] = value;

        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setInt;
            this._markPendingApply();
        }

        this._checkRenderState(index);
    }

    /**
     * 获取浮点。
     * @param	index shader索引。
     * @return	浮点。
     */
    getNumber(index: number): number {
        return this._data[index];
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        this._data[index] = value;
        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setFloat;
            this._markPendingApply();
        }

        this._checkRenderState(index);
    }

    /**
     * 获取Vector2向量。
     * @param	index shader索引。
     * @return Vector2向量。
     */
    getVector2(index: number): Vector2 {
        return this._data[index];
    }

    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setVector2;
            this._markPendingApply();
        }
    }

    /**
     * 获取Vector3向量。
     * @param	index shader索引。
     * @return Vector3向量。
     */
    getVector3(index: number): Vector3 {
        return this._data[index];
    }

    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setVector3;
            this._markPendingApply();
        }
    }

    /**
     * 获取颜色。
     * @param 	index shader索引。
     * @return  向量。
     */
    getVector(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setVector4;
            this._markPendingApply();
        }
    }

    /**
     * 获取颜色
     * @param index 索引
     * @returns 颜色
     */
    getColor(index: number): Color {
        return this._gammaColorMap.get(index);
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color): void {
        if (!value)
            return;
        if (this._data[index]) {
            let gammaColor = this._gammaColorMap.get(index);
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
        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setVector4;
            this._markPendingApply();
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
     * 获取矩阵。
     * @param	index shader索引。
     * @return  矩阵。
     */
    getMatrix4x4(index: number): Matrix4x4 {
        return this._data[index];
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else {
            this._data[index] = value.clone();
        }

        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setMatrix4x4;
            this._markPendingApply();
        }
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
     * 设置矩阵。
     * @param index 
     * @param value 
     */
    setMatrix3x3(index: number, value: Matrix3x3): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        }
        else {
            this._data[index] = value.clone();
        }

        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setMatrix3x3;
            this._markPendingApply();
        }
    }

    /**
     * 获取Buffer。
     * @param	index shader索引。
     * @return
     */
    getBuffer(index: number): Float32Array {
        return this._data[index];
    }

    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._data[index] = value;

        if (this._needCacheData) {
            this._updateCacheArray[index] = UniformBufferWriter.prototype.setArrayBuffer;
            this._markPendingApply();
        }
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._data[index];
        if (value) {
            let shaderDefine = WebGLEngine._texGammaDefine[index];
            if (shaderDefine && value && value.gammaCorrection > 1) {
                this.addDefine(shaderDefine);
            }
            else {
                // todo 自动的
                shaderDefine && this.removeDefine(shaderDefine);
            }
        }
        //维护Reference
        this._data[index] = value;
        lastValue && lastValue._removeReference();
        value && value._addReference();
    }

    _setInternalTexture(index: number, value: InternalTexture) {
        var lastValue: InternalTexture = this._data[index];
        if (value) {
            let shaderDefine = WebGLEngine._texGammaDefine[index];
            if (shaderDefine && value && value.gammaCorrection > 1) {
                this.addDefine(shaderDefine);
            }
            else {
                // todo 自动的
                shaderDefine && this.removeDefine(shaderDefine);
            }
        }
        //维护Reference
        this._data[index] = value;
        // lastValue && lastValue._removeReference();
        // value && value._addReference();
    }

    /**
     * 把攒下的 set 改动写进各自 UBO 的 view(经 setter 自动标脏),由 bufferMgr.upload() 统一调用。
     * 查不到 ubo 的属性不属于任何 UBO,丢弃即正确。
     */
    uploadCache() {
        let uploaded = false;
        for (let i in this._updateCacheArray) {
            uploaded = true;
            let index = parseInt(i);
            let ubo = this._uniformBuffersPropertyMap.get(index);
            if (ubo) {
                (this._updateCacheArray[i] as Function).call(ubo, index, this._data[index]);
            }
        }
        if (uploaded) {
            this._updateCacheArray = {};
        }
        //独立 UBO 不在 cluster 内、合并上传覆盖不到,须自己传:一个走缓存,多个才 forEach
        const single = this._singleUniformBuffer;
        if (single) {
            single.needUpload && single.upload();
        } else if (this._uniformBuffers.size > 1) {
            this._uniformBuffers.forEach(buffer => {
                buffer.needUpload && buffer.upload();
            });
        }
    }

    update(name: string) {
        if (Config._uniformBlock) {
            let unifomrMap = <WebGLCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(name);
            let uniformBuffer = this.createSubUniformBuffer(name, name, unifomrMap._idata);
            if (uniformBuffer) {
                uniformBuffer.upload();
            }
        }
    }

    /**
     * 获取纹理。
     * @param	index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture {
        return this._data[index];
    }

    getSourceIndex(value: any) {
        for (var i in this._data) {
            if (this._data[i] == value)
                return Number(i);
        }
        return -1;
    }

    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: WebGLShaderData): void {
        destObject.clearData();
        var destData: { [key: string]: number | boolean | Vector2 | Vector3 | Vector4 | Matrix3x3 | Matrix4x4 | Resource } = destObject._data;

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
                        destObject.setColor(parseInt(k), clonecolor);
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
        this._defineDatas.cloneTo(destObject._defineDatas);
        this._gammaColorMap.forEach((color, index) => {
            destObject._gammaColorMap.set(index, color.clone());
        });
    }

    getDefineData(): WebDefineDatas {
        return this._defineDatas;
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): WebGLShaderData {
        var dest: WebGLShaderData = new WebGLShaderData();
        this.cloneTo(dest);
        return dest;
    }

    destroy(): void {
        if ((this as any).destroyed) {
            return;
        }
        this.clearData();
        this._defineDatas.destroy();
        this._defineDatas = null;
        (this as any).destroyed = true;
    }
}

