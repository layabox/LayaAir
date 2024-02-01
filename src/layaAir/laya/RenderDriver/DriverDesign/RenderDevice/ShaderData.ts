import { UnifromBufferData } from "../../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { IClone } from "../../../utils/IClone";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { InternalTexture } from "./InternalTexture";


export type uboParams = { ubo: UniformBufferObject; uboBuffer: UnifromBufferData };
export enum ShaderDataType {
    Int,
    Bool,
    Float,
    Vector2,
    Vector3,
    Vector4,
    Color,
    Matrix4x4,
    Texture2D,
    TextureCube,
    Buffer,
    Matrix3x3,
}

export type ShaderDataItem = number | boolean | Vector2 | Vector3 | Vector4 | Color | Matrix4x4 | BaseTexture | Float32Array | Matrix3x3;

export function ShaderDataDefaultValue(type: ShaderDataType) {
    switch (type) {
        case ShaderDataType.Int:
            return 0;
        case ShaderDataType.Bool:
            return false;
        case ShaderDataType.Float:
            return 0;
        case ShaderDataType.Vector2:
            return Vector2.ZERO;
        case ShaderDataType.Vector3:
            return Vector3.ZERO;
        case ShaderDataType.Vector4:
            return Vector4.ZERO;
        case ShaderDataType.Color:
            return Color.BLACK;
        case ShaderDataType.Matrix4x4:
            return Matrix4x4.DEFAULT;
        case ShaderDataType.Matrix3x3:
            return Matrix3x3.DEFAULT;
    }
    return null;
}

/**
 * 着色器数据类。
 */
export class ShaderData implements IClone {
    /**@internal */
    protected _ownerResource: Resource;
    /**
     * @internal	
     */
    constructor(ownerResource: Resource = null) {
        this._ownerResource = ownerResource;
    }


    /**
     * @internal
     * 增加一个UBO Block
     * @param key 
     * @param ubo 
     * @param uboData 
     */
    _addCheckUBO(key: string, ubo: UniformBufferObject, uboData: UnifromBufferData) {
        throw new Error("Method not implemented.");
    }

    _releaseUBOData() {
        throw new Error("Method not implemented.");
    }


    getDefineData(): IDefineDatas {
        throw new Error("Method not implemented.");
    }

    /**
     * @internal
     */
    getData(): any {
        throw new Error("Method not implemented.");
    }

    /**
     * 增加Shader宏定义。
     * @param value 宏定义。
     */
    addDefine(define: ShaderDefine): void {
        throw new Error("Method not implemented.");
    }

    addDefines(define: IDefineDatas): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define: ShaderDefine): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 是否包含Shader宏定义。
     * @param value 宏定义。
     */
    hasDefine(define: ShaderDefine): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * 清空宏定义。
     */
    clearDefine(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取布尔。
     * @param	index shader索引。
     * @return  布尔。
     */
    getBool(index: number): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取整形。
     * @param	index shader索引。
     * @return  整形。
     */
    getInt(index: number): number {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取浮点。
     * @param	index shader索引。
     * @return	浮点。
     */
    getNumber(index: number): number {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取Vector2向量。
     * @param	index shader索引。
     * @return Vector2向量。
     */
    getVector2(index: number): Vector2 {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取Vector3向量。
     * @param	index shader索引。
     * @return Vector3向量。
     */
    getVector3(index: number): Vector3 {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取颜色。
     * @param 	index shader索引。
     * @return  向量。
     */
    getVector(index: number): Vector4 {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取颜色
     * @param index 索引
     * @returns 颜色
     */
    getColor(index: number): Color {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取矩阵。
     * @param	index shader索引。
     * @return  矩阵。
     */
    getMatrix4x4(index: number): Matrix4x4 {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取矩阵
     * @param index 
     * @returns 
     */
    getMatrix3x3(index: number): Matrix3x3 {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置矩阵。
     * @param index 
     * @param value 
     */
    setMatrix3x3(index: number, value: Matrix3x3): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取Buffer。
     * @param	index shader索引。
     * @return
     */
    getBuffer(index: number): Float32Array {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取纹理。
     * @param	index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture {
        throw new Error("Method not implemented.");
    }

    getSourceIndex(value: any): number {
        throw new Error("Method not implemented.");
    }

    /**
     * 
     * @param index 
     * @param value 
     */
    setUniformBuffer(index: number, value: UniformBufferObject) {
        throw new Error("Method not implemented.");
    }

    getUniformBuffer(index: number): UniformBufferObject {
        throw new Error("Method not implemented.");
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
                throw "unkone shader data type.";
        }
    }

    /**
     * @private
     */
    _setInternalTexture(index: number, value: InternalTexture): void {
        throw new Error("Method not implemented.");
    }


    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: ShaderData): void {
        throw new Error("Method not implemented.");
    }

    /**
     * clone UBO Data
     * @internal
     * @param uboDatas 
     */
    _cloneUBO(uboDatas: Map<string, uboParams>) {
        throw new Error("Method not implemented.");
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        throw new Error("Method not implemented.");
    }

    reset() {
        throw new Error("Method not implemented.");
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }
}

