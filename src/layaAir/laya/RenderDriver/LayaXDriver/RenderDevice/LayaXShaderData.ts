import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { IDeviceBuffer } from "../../DriverDesign/RenderDevice/IDeviceBuffer";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaXDefineDatas } from "../RenderModuleData/LayaXDefineDatas";
import { RTShaderDefine } from "../../RenderModuleData/RuntimeModuleData/RTShaderDefine";
import { LayaXInternalTex } from "./LayaXInternalTex";
import { LayaXInternalRT } from "./LayaXInternalRT";

/** RenderState 变化监听者接口（避免循环引用） */
export interface IRenderStateListener {
    _onRenderStateChanged(): void;
}

export class LayaXShaderData extends ShaderData {
    nativeObjID: number;
    _nativeObj: any;
    _defineDatas: LayaXDefineDatas = new LayaXDefineDatas();
    _textureData: { [key: number]: BaseTexture };
    _bufferData: { [key: number]: Float32Array };
    _deviceBufferData: { [key: number]: IDeviceBuffer };

    /** @internal RenderState 监听者集合 */
    _renderStateListeners: Set<IRenderStateListener> = new Set();

    /** @internal 共享矩阵 scratch：JS 写、index-only fast 触发同步消费（全实例共用一块，16 float） */
    private static _matScratchBuf = new ArrayBuffer(16 * 4);
    private static _matScratch = new Float32Array(LayaXShaderData._matScratchBuf);

    /** @internal 构造期缓存 Rust ShaderData handle，供 LayaXComputeContext 每帧 setShaderData 复用（省每次 getHandle FFI） */
    _handleId: number = 0;

    /**
     * @internal
     */
    constructor(ownerResource: Resource = null, createNativeObj: boolean = true) {
        super(ownerResource);
        if (createNativeObj) {
            this._nativeObj = new (window as any).conchLayaXShaderData((this._defineDatas as any)._nativeObj);
            this._nativeObj.bindMatrixScratch(LayaXShaderData._matScratchBuf);
            this._handleId = this._nativeObj.getHandle();
        } else {
            this._nativeObj = null;
        }
        this._textureData = {};
        this._bufferData = {};
        this._deviceBufferData = {};
    }

    getDefineData(): LayaXDefineDatas {
        return this._defineDatas;
    }

    /**
     * @internal
     */
    getData(): any {
        // TODO
    }

    clearData(): void {
        // 对齐 WebGPU/WebGL 后端:释放 BaseTexture 引用计数,清空 TS 侧值缓存。
        // setTexture 走 _addReference,这里必须对应 _removeReference,否则纹理
        // 引用计数悬挂直到下次同 slot 被覆盖或 ShaderData 整体销毁。
        for (let index in this._textureData) {
            let tex = this._textureData[index];
            tex && tex._removeReference();
        }
        this._textureData = {};
        this._bufferData = {};
        this._deviceBufferData = {};
        this._defineDatas.clear();
        // native 侧 clearData 只清主线程值缓存(values/gamma_colors),保留
        // 渲染线程按 serial 回查的纹理/Buffer 版本链,避免 in-flight 白屏。
        this._nativeObj.clearData();
    }

    /**
     * @ignore
     */
    addDefine(define: RTShaderDefine): void {
        this._defineDatas.add(define);
    }

    /**
     * @ignore
     */
    addDefines(define: LayaXDefineDatas): void {
        this._defineDatas.addDefineDatas(define);
    }

    /**
     * @ignore
     */
    removeDefine(define: RTShaderDefine): void {
        this._defineDatas.remove(define);
    }

    /**
     * @ignore
     */
    hasDefine(define: RTShaderDefine): boolean {
        return this._defineDatas.has(define);
    }

    /**
     * @ignore
     */
    clearDefine(): void {
        this._defineDatas.clear();
    }

    /** @internal 检测是否为 RenderState 属性 */
    private static _isRenderStateProp(index: number): boolean {
        return index === Shader3D.CULL
            || index === Shader3D.BLEND
            || index === Shader3D.BLEND_SRC
            || index === Shader3D.BLEND_DST
            || index === Shader3D.BLEND_SRC_RGB
            || index === Shader3D.BLEND_DST_RGB
            || index === Shader3D.BLEND_SRC_ALPHA
            || index === Shader3D.BLEND_DST_ALPHA
            || index === Shader3D.BLEND_EQUATION
            || index === Shader3D.BLEND_EQUATION_RGB
            || index === Shader3D.BLEND_EQUATION_ALPHA
            || index === Shader3D.DEPTH_TEST
            || index === Shader3D.DEPTH_WRITE
            || index === Shader3D.STENCIL_TEST
            || index === Shader3D.STENCIL_WRITE
            || index === Shader3D.STENCIL_WRITE_MASK
            || index === Shader3D.STENCIL_READ_MASK
            || index === Shader3D.STENCIL_Ref
            || index === Shader3D.STENCIL_Op
            || index === Shader3D.DEPTH_BIAS
            || index === Shader3D.DEPTH_BIAS_CONSTANT
            || index === Shader3D.DEPTH_BIAS_SLOPESCALE
            || index === Shader3D.DEPTH_BIAS_CLAMP;
    }

    /** @internal 通知所有监听者 RenderState 变化 */
    private _notifyRenderStateChanged(): void {
        if (this._renderStateListeners.size > 0) {
            this._renderStateListeners.forEach(l => l._onRenderStateChanged());
        }
    }

    _addRenderStateListener(listener: IRenderStateListener): void {
        this._renderStateListeners.add(listener);
    }

    _removeRenderStateListener(listener: IRenderStateListener): void {
        this._renderStateListeners.delete(listener);
    }

    getBool(index: number): boolean {
        return this._nativeObj.getBool(index);
    }

    setBool(index: number, value: boolean): void {
        this._nativeObj.setBool(index, value);
        if (LayaXShaderData._isRenderStateProp(index)) this._notifyRenderStateChanged();
    }

    getInt(index: number): number {
        return this._nativeObj.getInt(index);
    }

    setInt(index: number, value: number): void {
        this._nativeObj.setInt(index, value);
        if (LayaXShaderData._isRenderStateProp(index)) this._notifyRenderStateChanged();
    }

    getNumber(index: number): number {
        return this._nativeObj.getNumber(index);
    }

    setNumber(index: number, value: number): void {
        this._nativeObj.setNumber(index, value);
        if (LayaXShaderData._isRenderStateProp(index)) this._notifyRenderStateChanged();
    }

    getVector2(index: number): Vector2 {
        let value = this._nativeObj.getVector2(index);
        if (value == null) {
            return value;
        } else {
            let _tempVector2: Vector2 = new Vector2();
            _tempVector2.x = value.x;
            _tempVector2.y = value.y;
            return _tempVector2;
        }
    }

    setVector2(index: number, value: Vector2): void {
        this._nativeObj.setVector2(index, value.x, value.y);
    }

    getVector3(index: number): Vector3 {
        let value = this._nativeObj.getVector3(index);
        if (value == null) {
            return value;
        } else {
            let _tempVector3: Vector3 = new Vector3();
            _tempVector3.x = value.x;
            _tempVector3.y = value.y;
            _tempVector3.z = value.z;
            return _tempVector3;
        }
    }

    setVector3(index: number, value: Vector3): void {
        this._nativeObj.setVector3(index, value.x, value.y, value.z);
        if (index === Shader3D.STENCIL_Op) this._notifyRenderStateChanged();
    }

    getVector(index: number): Vector4 {
        let value = this._nativeObj.getVector(index);
        let _tempVector: Vector4 = new Vector4();
        _tempVector.x = value.x;
        _tempVector.y = value.y;
        _tempVector.z = value.z;
        _tempVector.w = value.w;
        return _tempVector;
    }

    setVector(index: number, value: Vector4): void {
        this._nativeObj.setVector(index, value.x, value.y, value.z, value.w);
    }

    getColor(index: number): Color {
        let value = this._nativeObj.getColor(index);
        if (value == null) {
            return value;
        } else {
            let _tempColor: Color = new Color();
            _tempColor.r = value.r;
            _tempColor.g = value.g;
            _tempColor.b = value.b;
            _tempColor.a = value.a;
            return _tempColor;
        }
    }

    setColor(index: number, value: Color): void {
        if (!value)
            return;
        this._nativeObj.setColor(index, value.r, value.g, value.b, value.a);
    }

    getMatrix4x4(index: number): Matrix4x4 {
        if (!this._nativeObj.getMatrix4x4ToScratch(index)) return null;
        let _tempMatrix4x4: Matrix4x4 = new Matrix4x4();
        _tempMatrix4x4.elements.set(LayaXShaderData._matScratch);
        return _tempMatrix4x4;
    }

    setMatrix4x4(index: number, value: Matrix4x4): void {
        LayaXShaderData._matScratch.set(value.elements);
        this._nativeObj.setMatrix4x4FromScratch(index);
    }

    getMatrix3x3(index: number): Matrix3x3 {
        if (!this._nativeObj.getMatrix3x3ToScratch(index)) return null;
        let _tempMatrix3x3: Matrix3x3 = new Matrix3x3();
        _tempMatrix3x3.elements.set(LayaXShaderData._matScratch.subarray(0, 9));
        return _tempMatrix3x3;
    }

    setMatrix3x3(index: number, value: Matrix3x3): void {
        LayaXShaderData._matScratch.set(value.elements);
        this._nativeObj.setMatrix3x3FromScratch(index);
    }

    getBuffer(index: number): Float32Array {
        return null;
    }

    setBuffer(index: number, value: Float32Array): void {
        this._bufferData[index] = value;
        this._nativeObj.setBuffer(index, value);
    }

    setDeviceBuffer(index: number, value: IDeviceBuffer): void {
        this._deviceBufferData[index] = value;
        this._nativeObj.setDeviceBuffer(index, (value as any)._nativeObj);
    }

    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._textureData[index];

        if (value && (value as any).bitmap) value = (value as any).bitmap;
        // Maintain reference
        this._textureData[index] = value;
        if (value && value._texture) {
            let tex = value._texture;
            if (tex instanceof LayaXInternalRT) {
                // RT 作为纹理使用时，取其第一个 color attachment
                let colorTex = tex._textures[0];
                this._setInternalTexture(index, colorTex ? (colorTex as LayaXInternalTex)._nativeObj : null);
            } else {
                this._setInternalTexture(index, (tex as LayaXInternalTex)._nativeObj);
            }
        } else {
            this._setInternalTexture(index, null);
        }
        lastValue && lastValue._removeReference();
        value && value._addReference();
    }

    /**@internal */
    _setInternalTexture(index: number, value: InternalTexture) {
        // value may be a TS LayaXInternalTex wrapper (from applyRenderData) or
        // a raw C++ native object (from setTexture). Always extract _nativeObj if present.
        let nativeVal = value ? ((value as any)) : null;
        this._nativeObj._setInternalTexture(index, nativeVal);
    }

    getTexture(index: number): BaseTexture {
        return this._textureData[index];
    }

    update(name: string) {
        this._nativeObj.update(name);
    }

    cloneTo(destObject: LayaXShaderData): void {
        this._nativeObj.cloneTo(destObject._nativeObj);
        var dest: LayaXShaderData = <LayaXShaderData>destObject;
        var destData: any = dest._textureData;
        for (var k in this._textureData) {
            var value: any = this._textureData[k];
            if (value != null) {
                if (value instanceof BaseTexture) {
                    destData[k] = value;
                    value._addReference();
                    // 同步纹理到 Rust ShaderDataBlock
                    dest.setTexture(parseInt(k), value);
                }
            }
        }
    }

    clone() {
        var dest: LayaXShaderData = new LayaXShaderData();
        this.cloneTo(dest);
        return dest;
    }

    destroy(): void {
        // 对齐 WebGPU:销毁前先 clearData 释放纹理引用计数,避免 ShaderData
        // 被销毁时 _textureData 里还持着 BaseTexture 的 ref 导致资源延迟释放。
        this.clearData();
        this._nativeObj.destroy();
        // ShaderData 独占创建 DefineDatas，销毁时必须同步释放 native 注册槽位。
        this._defineDatas.destroy();
    }
}
