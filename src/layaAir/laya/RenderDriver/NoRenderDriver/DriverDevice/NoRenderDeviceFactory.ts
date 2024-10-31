import { Config } from "../../../../Config";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { UnifromBufferData } from "../../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { ShaderProcessInfo, ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData, ShaderDataItem, ShaderDataType, uboParams } from "../../DriverDesign/RenderDevice/ShaderData";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";

export class NoRenderDeviceFactory implements IRenderDeviceFactory {
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
        return new NoRenderGeometryElement();
    }
    createEngine(config: Config, canvas: any): Promise<void> {
        return Promise.resolve();
    }
    createGlobalUniformMap(blockName: string): CommandUniformMap {
        return new NoRenderCommandUnifojrmMap(blockName);
    }
    createShaderData(ownerResource?: Resource): ShaderData {
        return new NoRenderShaderData();
    }

}

export class NoRenderCommandUnifojrmMap extends CommandUniformMap {
    constructor(stateName: string) {
        super(stateName);
    }
    /**
     * 增加一个Uniform参数
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = null): void {

    }

    /**
     * 增加一个UniformArray参数
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number, block: string = ""): void {

    } //兼容WGSL

    /**
     * 增加一个Uniform
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {

    }
}

export class NoRenderShaderInstance implements IShaderInstance {
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
    }
    _disposeResource(): void {
    }
}

export class NoRenderIndexBuffer implements IIndexBuffer {
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
    bufferState: IBufferState;
    mode: MeshTopology;
    drawType: DrawType;
    instanceCount: number;
    indexFormat: IndexFormat;
    setDrawArrayParams(first: number, count: number): void {
    }
    setDrawElemenParams(count: number, offset: number): void {
    }
    clearRenderParams(): void {
    }
    destroy(): void {
    }

}

export class NoRenderShaderData extends ShaderData {
    /**@internal */
    _data: any = {};
    /** @internal */
    _defineDatas: WebDefineDatas = new WebDefineDatas();

    /**
     * @internal
     * 增加一个UBO Block
     * @param key 
     * @param ubo 
     * @param uboData 
     */
    _addCheckUBO(key: string, ubo: UniformBufferObject, uboData: UnifromBufferData) {

    }

    _releaseUBOData() {

    }


    getDefineData(): WebDefineDatas {
        return this._defineDatas;
    }

    /**
     * @internal
     */
    getData(): any {
        return this._data;
    }

    /**
     * 增加Shader宏定义。
     * @param value 宏定义。
     */
    addDefine(define: ShaderDefine): void {
        this._defineDatas.add(define);
    }

    addDefines(define: IDefineDatas): void {
        this._defineDatas.addDefineDatas(define);
    }

    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define: ShaderDefine): void {
        this._defineDatas.remove(define);
    }

    /**
     * 是否包含Shader宏定义。
     * @param value 宏定义。
     */
    hasDefine(define: ShaderDefine): boolean {
        return this._defineDatas.has(define);
    }

    /**
     * 清空宏定义。
     */
    clearDefine(): void {

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
        this._data[index] = value;
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
        this._data[index] = value;
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
        this._data[index] = value;
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
        this._data[index] = value;
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
        this._data[index] = value;
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
        this._data[index] = value;
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
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        this._data[index] = value;
    }

    /**
     * 获取纹理。
     * @param	index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture {
        return this._data[index];
    }

    /**
     * 
     * @param index 
     * @param value 
     */
    setUniformBuffer(index: number, value: UniformBufferObject) {
        this._data[index] = value;
    }

    getUniformBuffer(index: number): UniformBufferObject {
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
    _setInternalTexture(index: number, value: InternalTexture): void {

    }


    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: NoRenderShaderData): void {
        let destData: { [key: string]: number | boolean | Vector2 | Vector3 | Vector4 | Matrix3x3 | Matrix4x4 | Resource } = destObject._data;
        for (let k in this._data) { //TODO:需要优化,杜绝is判断，慢
            let value: any = this._data[k];
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
    }

    /**
     * clone UBO Data
     * @internal
     * @param uboDatas 
     */
    _cloneUBO(uboDatas: Map<string, uboParams>) {

    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: NoRenderShaderData = new NoRenderShaderData();
        this.cloneTo(dest);
        return dest;
    }

    reset() {
        for (var k in this._data) {
            //维护Refrence
            var value: any = this._data[k];
            if (value instanceof Resource) {
                value._removeReference();
            }
        }
        this._data = {};
        this._defineDatas.clear();
    }

    destroy(): void {
        this._defineDatas.destroy();
        this._defineDatas = null;
        for (var k in this._data) {
            //维护Refrence
            var value: any = this._data[k];
            if (value instanceof Resource) {
                value._removeReference();
            }
        }
        this._data = null;
    }
}

