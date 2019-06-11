import { IClone } from "../core/IClone";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Resource } from "laya/resource/Resource";
import { BaseTexture } from "laya/resource/BaseTexture";
/**
 * @private
 */
export declare class ShaderData implements IClone {
    /**@private */
    private _ownerResource;
    /**@private */
    private _data;
    /** @private */
    _defineValue: number;
    /**
     * @private
     */
    constructor(ownerResource?: Resource);
    /**
     * @private
     */
    _initData(): void;
    /**
     * @private
     */
    getData(): any;
    /**
     * 增加Shader宏定义。
     * @param value 宏定义。
     */
    addDefine(define: number): void;
    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define: number): void;
    /**
     * 是否包含Shader宏定义。
     * @param value 宏定义。
     */
    hasDefine(define: number): boolean;
    /**
     * 清空宏定义。
     */
    clearDefine(): void;
    /**
     * 获取布尔。
     * @param	index shader索引。
     * @return  布尔。
     */
    getBool(index: number): boolean;
    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void;
    /**
     * 获取整形。
     * @param	index shader索引。
     * @return  整形。
     */
    getInt(index: number): number;
    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void;
    /**
     * 获取浮点。
     * @param	index shader索引。
     * @return  浮点。
     */
    getNumber(index: number): number;
    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void;
    /**
     * 获取Vector2向量。
     * @param	index shader索引。
     * @return Vector2向量。
     */
    getVector2(index: number): Vector2;
    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void;
    /**
     * 获取Vector3向量。
     * @param	index shader索引。
     * @return Vector3向量。
     */
    getVector3(index: number): Vector3;
    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void;
    /**
     * 获取颜色。
     * @param	index shader索引。
     * @return 颜色向量。
     */
    getVector(index: number): Vector4;
    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void;
    /**
     * 获取四元数。
     * @param	index shader索引。
     * @return 四元。
     */
    getQuaternion(index: number): Quaternion;
    /**
     * 设置四元数。
     * @param	index shader索引。
     * @param	value 四元数。
     */
    setQuaternion(index: number, value: Quaternion): void;
    /**
     * 获取矩阵。
     * @param	index shader索引。
     * @return  矩阵。
     */
    getMatrix4x4(index: number): Matrix4x4;
    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void;
    /**
     * 获取Buffer。
     * @param	index shader索引。
     * @return
     */
    getBuffer(shaderIndex: number): Float32Array;
    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void;
    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void;
    /**
     * 获取纹理。
     * @param	index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture;
    /**
     * 设置Attribute。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setAttribute(index: number, value: Int32Array): void;
    /**
     * 获取Attribute。
     * @param	index shader索引。
     * @return  纹理。
     */
    getAttribute(index: number): any[];
    /**
     * 获取长度。
     * @return 长度。
     */
    getLength(): number;
    /**
     * 设置长度。
     * @param 长度。
     */
    setLength(value: number): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
    /**@private [NATIVE]*/
    private _int32Data;
    /**@private [NATIVE]*/
    private _float32Data;
    /**@private [NATIVE]*/
    _nativeArray: any[];
    /**@private [NATIVE]*/
    _frameCount: number;
    /**@private [NATIVE]*/
    static _SET_RUNTIME_VALUE_MODE_REFERENCE_: boolean;
    /**@private [NATIVE]*/
    _runtimeCopyValues: any[];
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneToForNative(destObject: any): void;
    /**
     * @private [NATIVE]
     */
    _initDataForNative(): void;
    needRenewArrayBufferForNative(index: number): void;
    getDataForNative(): any[];
    /**
     *@private [NATIVE]
     */
    getIntForNative(index: number): number;
    /**
     *@private [NATIVE]
     */
    setIntForNative(index: number, value: number): void;
    /**
     *@private [NATIVE]
     */
    getBoolForNative(index: number): boolean;
    /**
     *@private [NATIVE]
     */
    setBoolForNative(index: number, value: boolean): void;
    /**
     *@private [NATIVE]
     */
    getNumberForNative(index: number): number;
    /**
     *@private [NATIVE]
     */
    setNumberForNative(index: number, value: number): void;
    /**
     *@private [NATIVE]
     */
    getMatrix4x4ForNative(index: number): Matrix4x4;
    /**
     *@private [NATIVE]
     */
    setMatrix4x4ForNative(index: number, value: Matrix4x4): void;
    /**
     *@private [NATIVE]
     */
    getVectorForNative(index: number): any;
    /**
     *@private [NATIVE]
     */
    setVectorForNative(index: number, value: any): void;
    /**
     *@private [NATIVE]
     */
    getVector2ForNative(index: number): any;
    /**
     *@private [NATIVE]
     */
    setVector2ForNative(index: number, value: any): void;
    /**
     *@private [NATIVE]
     */
    getVector3ForNative(index: number): any;
    /**
     *@private [NATIVE]
     */
    setVector3ForNative(index: number, value: any): void;
    /**
     *@private [NATIVE]
     */
    getQuaternionForNative(index: number): Quaternion;
    /**
     *@private [NATIVE]
     */
    setQuaternionForNative(index: number, value: any): void;
    /**
     *@private [NATIVE]
     */
    getBufferForNative(shaderIndex: number): Float32Array;
    /**
     *@private [NATIVE]
     */
    setBufferForNative(index: number, value: Float32Array): void;
    /**
     *@private [NATIVE]
     */
    getAttributeForNative(index: number): any[];
    /**
     *@private [NATIVE]
     */
    setAttributeForNative(index: number, value: Int32Array): void;
    /**
     *@private [NATIVE]
     */
    getTextureForNative(index: number): BaseTexture;
    /**
     *@private [NATIVE]
     */
    setTextureForNative(index: number, value: BaseTexture): void;
    setReferenceForNative(value: any): number;
    static setRuntimeValueMode(bReference: boolean): void;
    clearRuntimeCopyArray(): void;
}
