import { Config } from "../../../../Config";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { HTMLCanvas } from "../../../resource/HTMLCanvas";
import { Resource } from "../../../resource/Resource";
import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { FastSinglelist } from "../../../utils/SingletonList";
import { NoRenderEngine } from "./NoRenderEngineFactory";
import { ShaderProcessInfo, ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap, UniformOptions, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IDeviceBuffer } from "../../DriverDesign/RenderDevice/IDeviceBuffer";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { SetRenderDataCMD, RenderCMDType, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";

export class NoRenderDefineDatas implements IDefineDatas {
    _mask: Array<number> = [];
    _length: number = 0;

    _intersectionDefineDatas(define: IDefineDatas): void {
        var unionMask: Array<number> = define._mask;
        var mask: Array<number> = this._mask;
        for (var i: number = this._length - 1; i >= 0; i--) {
            var value: number = mask[i] & unionMask[i];
            if (value === 0 && i === this._length - 1)
                this._length--;
            else
                mask[i] = value;
        }
    }

    add(define: ShaderDefine): boolean {
        var index: number = define._index;
        var size: number = index + 1;
        var mask: Array<number> = this._mask;
        var maskStart: number = this._length;
        if (maskStart < size) {
            (mask.length < size) && (mask.length = size);
            for (; maskStart < index; maskStart++)
                mask[maskStart] = 0;
            mask[index] = define._value;
            this._length = size;
            return true;
        }
        let last = mask[index];
        mask[index] |= define._value;
        return last !== mask[index];
    }

    remove(define: ShaderDefine): boolean {
        var index: number = define._index;
        var mask: Array<number> = this._mask;
        var endIndex: number = this._length - 1;
        if (index > endIndex) return false;
        let lastValue = mask[index];
        var newValue = mask[index] & ~define._value;
        if (index == endIndex && newValue === 0)
            this._length--;
        else
            mask[index] = newValue;
        return lastValue !== newValue;
    }

    addDefineDatas(define: IDefineDatas): void {
        var addMask: Array<number> = define._mask;
        var size: number = define._length;
        var mask: Array<number> = this._mask;
        var maskStart: number = this._length;
        if (maskStart < size) {
            mask.length = size;
            for (var i: number = 0; i < maskStart; i++)
                mask[i] |= addMask[i];
            for (; i < size; i++)
                mask[i] = addMask[i];
            this._length = size;
        } else {
            for (var i: number = 0; i < size; i++)
                mask[i] |= addMask[i];
        }
    }

    removeDefineDatas(define: IDefineDatas): void {
        var removeMask: Array<number> = define._mask;
        var mask: Array<number> = this._mask;
        var endIndex: number = this._length - 1;
        var i = Math.min(define._length, endIndex);
        for (; i >= 0; i--) {
            var newValue = mask[i] & ~removeMask[i];
            if (i == endIndex && newValue === 0) {
                endIndex--;
                this._length--;
            } else {
                mask[i] = newValue;
            }
        }
    }

    has(define: ShaderDefine): boolean {
        var index: number = define._index;
        if (index >= this._length) return false;
        return (this._mask[index] & define._value) !== 0;
    }

    clear(): void {
        this._length = 0;
    }

    cloneTo(destObject: IDefineDatas): void {
        var destMask: Array<number> = destObject._mask;
        var mask: Array<number> = this._mask;
        var count: number = this._length;
        destMask.length = count;
        for (var i: number = 0; i < count; i++)
            destMask[i] = mask[i];
        destObject._length = count;
    }

    clone(): IDefineDatas {
        var dest: NoRenderDefineDatas = new NoRenderDefineDatas();
        this.cloneTo(dest);
        return dest;
    }

    destroy(): void {
        delete this._mask;
    }
}

export class NoRenderDeviceFactory implements IRenderDeviceFactory {
    private _uniformMaps = new Map<string, NoRenderCommandUnifojrmMap>();
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): IShaderInstance {
        return new NoRenderShaderInstance();
    }
    createIndexBuffer(bufferUsage: BufferUsage): IIndexBuffer {
        return new NoRenderIndexBuffer();
    }
    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer {
        return new NoRenderVertexBuffer();
    }
    createBufferState(): IBufferState {
        return new NoRenderBufferState();
    }
    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement {
        return new NoRenderGeometryElement(mode, drawType);
    }
    createEngine(config: Config, canvas: HTMLCanvas): Promise<void> {
        let engine = new NoRenderEngine();
        engine.initRenderEngine(null);
        LayaGL.renderEngine = engine;
        LayaGL.textureContext = engine.getTextureContext();
        return Promise.resolve();
    }
    createGlobalUniformMap(blockName: string): CommandUniformMap {
        let map = this._uniformMaps.get(blockName);
        if (!map) {
            map = new NoRenderCommandUnifojrmMap(blockName);
            this._uniformMaps.set(blockName, map);
        }
        return map;
    }
    createShaderData(ownerResource?: Resource): ShaderData {
        return new NoRenderShaderData(ownerResource);
    }

}

export class NoRenderCommandUnifojrmMap extends CommandUniformMap {
    _idata = new Map<number, UniformProperty>();
    _defaultTextures = new Map<number, BaseTexture>();
    private _stateID: number;

    constructor(stateName: string) {
        super(stateName);
        this._stateID = LayaGL.renderEngine.propertyNameToID(stateName);
    }

    hasPtrID(propertyID: number): boolean {
        return this._stateID === propertyID || this._idata.has(propertyID);
    }
    /**
     * 增加一个Uniform参数
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, options?: UniformOptions): void {
        this._idata.set(propertyID, { id: propertyID, propertyName: propertyKey, uniformtype, arrayLength: 0, ...options });
    }

    /**
     * 增加一个UniformArray参数
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number, block: string = ""): void {
        this._idata.set(propertyID, { id: propertyID, propertyName, uniformtype, arrayLength });
    } //兼容WGSL

    setDefaultTextureData(key: number, defaultTex: BaseTexture): void {
        this._defaultTextures.set(key, defaultTex);
    }
}

export class NoRenderShaderInstance implements IShaderInstance {
    _serializeShader(): ArrayBuffer {
        return null;
    }
    _deserialize(buffer: ArrayBuffer): boolean {
        return false;
    }
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
    }
    _disposeResource(): void {
    }
}

export class NoRenderIndexBuffer implements IIndexBuffer {
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
    }
    destroy(): void {
    }
    _setIndexDataLength(data: number): void {
    }
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void {
    }
    indexType: IndexFormat;
    indexCount: number;

}

export class NoRenderVertexBuffer implements IVertexBuffer {
    vertexDeclaration: VertexDeclaration;
    instanceBuffer: boolean;
    getStorageBuffer(): IDeviceBuffer {
        return null;
    }
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
    }
    setDataLength(byteLength: number): void {
    }
    destroy(): void {
    }
}

export class NoRenderBufferState implements IBufferState {
    _bindedIndexBuffer: IIndexBuffer;
    _vertexBuffers: IVertexBuffer[] = [];
    applyState(vertexBuffers: IVertexBuffer[], indexBuffer: IIndexBuffer): void {

        this._vertexBuffers = vertexBuffers.slice();
        this._bindedIndexBuffer = indexBuffer;
    }

    destroy(): void {
    }

}

export class NoRenderGeometryElement implements IRenderGeometryElement {
    constructor(mode: MeshTopology = MeshTopology.Triangles, drawType: DrawType = DrawType.DrawElement) {
        this.mode = mode;
        this.drawType = drawType;
    }

    getDrawDataParams(out: FastSinglelist<number>): void {
        out && this.drawParams.cloneTo(out);
    }
    bufferState: IBufferState;
    mode: MeshTopology;
    drawType: DrawType;
    instanceCount: number = 1;
    indexFormat: IndexFormat;
    drawParams: FastSinglelist<number> = new FastSinglelist();
    setDrawArrayParams(first: number, count: number): void {
        this.drawParams.add(first);
        this.drawParams.add(count);
    }
    setDrawElemenParams(count: number, offset: number): void {
        this.drawParams.add(offset);
        this.drawParams.add(count);
    }
    clearRenderParams(): void {
        this.drawParams.clear();
    }
    destroy(): void {
        this.drawParams.clear();
        this.bufferState = null;
    }

}

export class NoRenderShaderData extends ShaderData {
    /**@internal */
    _data: any = {};
    /** @internal */
    _defineDatas: NoRenderDefineDatas = new NoRenderDefineDatas();

    getDefineData(): NoRenderDefineDatas {
        return this._defineDatas;
    }

    /**
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

    /**
     * @ignore
     */
    addDefines(define: IDefineDatas): void {
        this._defineDatas.addDefineDatas(define as NoRenderDefineDatas);
    }

    /**
     * @ignore
     */
    removeDefine(define: ShaderDefine): void {
        this._defineDatas.remove(define);
    }

    /**
     * @ignore
     */
    hasDefine(define: ShaderDefine): boolean {
        return this._defineDatas.has(define);
    }

    clearDefine(): void {
        this._defineDatas.clear();
    }
    clearData(): void {
        for (const k in this._data) {
            const value: any = this._data[k];
            if (value instanceof Resource) {
                value._removeReference();
            }
        }
        this._data = {};
        this.clearDefine();
    }

    /**
     * 获取布尔。
     * @param index shader索引。
     * @return  布尔。
     */
    getBool(index: number): boolean {
        return this._data[index];
    }

    /**
     * 设置布尔。
     * @param index shader索引。
     * @param value 布尔。
     */
    setBool(index: number, value: boolean): void {
        this._data[index] = value;
    }

    /**
     * 获取整形。
     * @param index shader索引。
     * @return  整形。
     */
    getInt(index: number): number {
        return this._data[index];
    }

    /**
     * 设置整型。
     * @param index shader索引。
     * @param value 整形。
     */
    setInt(index: number, value: number): void {
        this._data[index] = value;
    }

    /**
     * 获取浮点。
     * @param index shader索引。
     * @return	浮点。
     */
    getNumber(index: number): number {
        return this._data[index];
    }

    /**
     * 设置浮点。
     * @param index shader索引。
     * @param value 浮点。
     */
    setNumber(index: number, value: number): void {
        this._data[index] = value;
    }

    /**
     * 获取Vector2向量。
     * @param index shader索引。
     * @return Vector2向量。
     */
    getVector2(index: number): Vector2 {
        return this._data[index];
    }

    /**
     * 设置Vector2向量。
     * @param index shader索引。
     * @param value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        const current = this._data[index];
        if (value && current instanceof Vector2)
            value.cloneTo(current);
        else
            this._data[index] = value ? value.clone() : value;
    }

    /**
     * 获取Vector3向量。
     * @param index shader索引。
     * @return Vector3向量。
     */
    getVector3(index: number): Vector3 {
        return this._data[index];
    }

    /**
     * 设置Vector3向量。
     * @param index shader索引。
     * @param value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        const current = this._data[index];
        if (value && current instanceof Vector3)
            value.cloneTo(current);
        else
            this._data[index] = value ? value.clone() : value;
    }

    /**
     * 获取颜色。
     * @param index shader索引。
     * @return  向量。
     */
    getVector(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 设置向量。
     * @param index shader索引。
     * @param value 向量。
     */
    setVector(index: number, value: Vector4): void {
        const current = this._data[index];
        if (value && current instanceof Vector4)
            value.cloneTo(current);
        else
            this._data[index] = value ? value.clone() : value;
    }

    /**
     * 获取颜色
     * @param index 索引
     * @returns 颜色
     */
    getColor(index: number): Color {
        return this._data[index];
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color): void {
        const current = this._data[index];
        if (value && current instanceof Color)
            value.cloneTo(current);
        else
            this._data[index] = value ? value.clone() : value;
    }

    /**
     * 获取矩阵。
     * @param index shader索引。
     * @return  矩阵。
     */
    getMatrix4x4(index: number): Matrix4x4 {
        return this._data[index];
    }

    /**
     * 设置矩阵。
     * @param index shader索引。
     * @param value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        const current = this._data[index];
        if (value && current instanceof Matrix4x4)
            value.cloneTo(current);
        else
            this._data[index] = value ? value.clone() : value;
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
        const current = this._data[index];
        if (value && current instanceof Matrix3x3)
            value.cloneTo(current);
        else
            this._data[index] = value ? value.clone() : value;
    }

    /**
     * 获取Buffer。
     * @param index shader索引。
     * @return
     */
    getBuffer(index: number): Float32Array {
        return this._data[index];
    }

    /**
     * 设置Buffer。
     * @param index shader索引。
     * @param value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._data[index] = value;
    }

    /**
     * 设置纹理。
     * @param index shader索引。
     * @param value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        const previous = this._data[index];
        if (previous === value) return;
        // Retain the new texture before releasing the previous one.
        value && value._addReference();
        this._data[index] = value;
        if (previous instanceof Resource) previous._removeReference();
    }

    /**
     * 获取纹理。
     * @param index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture {
        return this._data[index];
    }

    setShaderData(uniformIndex: number, type: ShaderDataType, value: ShaderDataItem | Quaternion) {
        switch (type) {
            case ShaderDataType.Int:
                this.setInt(uniformIndex, <number>value);
                break;
            case ShaderDataType.Bool:
                this.setBool(uniformIndex, <boolean>value);
                break;
            case ShaderDataType.Float:
                this.setNumber(uniformIndex, <number>value);
                break;
            case ShaderDataType.Vector2:
                this.setVector2(uniformIndex, <Vector2>value);
                break;
            case ShaderDataType.Vector3:
                this.setVector3(uniformIndex, <Vector3>value);
                break;
            case ShaderDataType.Vector4:
                this.setVector(uniformIndex, <Vector4>value);
                break;
            case ShaderDataType.Color:
                this.setColor(uniformIndex, <Color>value);
                break;
            case ShaderDataType.Matrix4x4:
                this.setMatrix4x4(uniformIndex, <Matrix4x4>value);
                break;
            case ShaderDataType.Matrix3x3:
                this.setMatrix3x3(uniformIndex, <Matrix3x3>value);
                break;
            case ShaderDataType.Texture2D:
            case ShaderDataType.TextureCube:
            case ShaderDataType.Texture2DArray:
            case ShaderDataType.Texture3D:
                this.setTexture(uniformIndex, <BaseTexture>value);
                break;
            case ShaderDataType.Buffer:
                this.setBuffer(uniformIndex, <Float32Array>value);
                break;
            default:
                throw new Error(`unkown shader data type: ${type}`);
        }
    }

    getShaderData(uniformIndex: number, type: ShaderDataType): ShaderDataItem {
        switch (type) {
            case ShaderDataType.Int:
                return this.getInt(uniformIndex);
            case ShaderDataType.Bool:
                return this.getBool(uniformIndex);
            case ShaderDataType.Float:
                return this.getNumber(uniformIndex);
            case ShaderDataType.Vector2:
                return this.getVector2(uniformIndex);
            case ShaderDataType.Vector3:
                return this.getVector3(uniformIndex);
            case ShaderDataType.Vector4:
                return this.getVector(uniformIndex);
            case ShaderDataType.Color:
                return this.getColor(uniformIndex);
            case ShaderDataType.Matrix4x4:
                return this.getMatrix4x4(uniformIndex);
            case ShaderDataType.Texture2D:
            case ShaderDataType.TextureCube:
            case ShaderDataType.Texture2DArray:
            case ShaderDataType.Texture3D:
                return this.getTexture(uniformIndex);
            case ShaderDataType.Buffer:
                return this.getBuffer(uniformIndex);
            case ShaderDataType.Matrix3x3:
                return this.getMatrix3x3(uniformIndex);
            case ShaderDataType.Matrix4x4:
                return this.getMatrix4x4(uniformIndex);
            default:
                throw "unknown shader data type.";
        }
    }

    /**
     * @private
     */
    _setInternalTexture(index: number, value: InternalTexture | InternalRenderTarget): void {
        const previous = this._data[index];
        this._data[index] = value;
        if (previous instanceof Resource) previous._removeReference();
    }

    update(name: string): void {
        // CPU values are already current; NoRender has no uniform buffers to upload.
    }


    /**
     * 克隆。
     * @param destObject 克隆源。
     */
    cloneTo(destObject: NoRenderShaderData): void {
        if (destObject === this) return;
        destObject.clearData();
        for (const key in this._data) {
            const value = this._data[key];
            if (value instanceof Resource) {
                value._addReference();
                destObject._data[key] = value;
            } else if (value instanceof Float32Array) {
                destObject._data[key] = value.slice();
            } else if (value instanceof Color || value instanceof Vector2 || value instanceof Vector3 ||
                value instanceof Vector4 || value instanceof Matrix3x3 || value instanceof Matrix4x4) {
                destObject._data[key] = value.clone();
            } else {
                // Scalars, nulls and non-owned internal textures retain their values.
                destObject._data[key] = value;
            }
        }
        this._defineDatas.cloneTo(destObject._defineDatas);
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest: NoRenderShaderData = new NoRenderShaderData();
        this.cloneTo(dest);
        return dest;
    }

    destroy(): void {
        if (!this._data) return;
        this.clearData();
        this._defineDatas.destroy();
        this._defineDatas = null;
        this._data = null;
    }
}

export class NoRenderSetRenderData extends SetRenderDataCMD {
    type: RenderCMDType;
    protected _dataType: ShaderDataType;
    protected _propertyID: number;
    protected _dest: NoRenderShaderData;
    protected _value: ShaderDataItem;

    data_v4: Vector4;
    data_v3: Vector3;
    data_v2: Vector2;
    data_mat: Matrix4x4;
    data_number: number;
    data_texture: BaseTexture;
    data_Color: Color;
    data_Buffer: Float32Array;
    get dataType(): ShaderDataType {
        return this._dataType;
    }

    set dataType(value: ShaderDataType) {
        this._dataType = value;
    }

    get propertyID(): number {
        return this._propertyID;
    }

    set propertyID(value: number) {
        this._propertyID = value;
    }

    get dest(): NoRenderShaderData {
        return this._dest;
    }

    set dest(value: NoRenderShaderData) {
        this._dest = value;
    }

    get value(): ShaderDataItem {
        return this._value;
    }
    set value(value: ShaderDataItem) {
        this._value = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeData;
    }

    apply(context: any): void {
    }
}

export class NoRenderSetShaderDefine extends SetShaderDefineCMD {
    type: RenderCMDType;
    protected _define: ShaderDefine;
    protected _dest: NoRenderShaderData;
    protected _add: boolean;

    get define(): ShaderDefine {
        return this._define;
    }

    set define(value: ShaderDefine) {
        this._define = value;
    }

    get dest(): NoRenderShaderData {
        return this._dest;
    }

    set dest(value: NoRenderShaderData) {
        this._dest = value;
    }

    get add(): boolean {
        return this._add;
    }

    set add(value: boolean) {
        this._add = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeShaderDefine;
    }

    apply(context: any): void {
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.renderDeviceFactory)
        LayaGL.renderDeviceFactory = new NoRenderDeviceFactory();
});

