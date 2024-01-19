import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { InternalTexture } from "../../RenderInterface/InternalTexture";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../../RenderInterface/ShaderData";
import { DefineDatas } from "../../RenderShader/DefineDatas";
import { ShaderDefine } from "../../RenderShader/ShaderDefine";
import { UnifromBufferData } from "../../UniformBufferData";
import { UniformBufferObject } from "../../UniformBufferObject";


export enum NativeShaderDataType {
    Number32,
    Vector2,
    Vector3,
    Vector4,
    Matrix4x4,
    Number32Array,
    Texture,
    ShaderDefine,
    UBO,
}

export class NativeShaderData extends ShaderData {
    nativeObjID: number;
    _nativeObj: any;

    /**
     * @internal	
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource)
        // this._initData();
        this._nativeObj = new (window as any).conchRTShaderData();

    }
    /**
         * @internal
         * 增加一个UBO Block
         * @param key 
         * @param ubo 
         * @param uboData 
         */
    _addCheckUBO(key: string, ubo: UniformBufferObject, uboData: UnifromBufferData) {
        //throw new Error("Method not implemented.");
    }

    _releaseUBOData() {
        //throw new Error("Method not implemented.");
    }


    getDefineData(): DefineDatas {
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

    addDefines(define: DefineDatas): void {
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
        this._nativeObj.setBool(index, value);
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
        this._nativeObj.setInt(index, value);
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
        this._nativeObj.setNumber(index, value);
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
        this._nativeObj.setVector2(index, value);
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
        this._nativeObj.setVector3(index, value);
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
        this._nativeObj.setVector(index, value);
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
        this._nativeObj.setColor(index, value);
    }

    /**
     * @internal
     * @param index 
     */
    getLinearColor(index: number): Vector4 {
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
        this._nativeObj.setMatrix4x4(index, value);
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
        this._nativeObj.setMatrix3x3(index, value);
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
        this._nativeObj.setBuffer(index, value);
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        
        throw new Error("Method not implemented.");
    }

    /**@internal */
    _setInternalTexture(index: number, value: InternalTexture) {
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
     * set shader data
     * @deprecated
     * @param index uniformID
     * @param value data
     */
    setValueData(index: number, value: any) {
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
        throw new Error("Method not implemented.");
    }

    getShaderData(uniformIndex: number, type: ShaderDataType): ShaderDataItem {
        throw new Error("Method not implemented.");
    }

    cloneTo(destObject: NativeShaderData) {
        // var dest: NativeShaderData = <NativeShaderData>destObject;
        // for (var k in this._data) {//TODO:需要优化,杜绝is判断，慢
        //     var value: any = this._data[k];
        //     if (value != null) {
        //         if (typeof (value) == 'boolean') {
        //             destObject.setBool((k as any), value);
        //         } else if (typeof (value) == 'number') {
        //             destObject.setNumber(k as any, <number>value);
        //         } else if (value instanceof Vector2) {
        //             destObject.setVector2(k as any, <Vector2>value);
        //         } else if (value instanceof Vector3) {
        //             destObject.setVector3(k as any, <Vector3>value);
        //         } else if (value instanceof Vector4) {
        //             destObject.setVector(k as any, <Vector4>value);
        //         } else if (value instanceof Matrix4x4) {
        //             destObject.setMatrix4x4(k as any, <Matrix4x4>value);
        //         } else if (value instanceof BaseTexture) {
        //             destObject.setTexture(k as any, value);
        //         }
        //     }
        // }
        // this._defineDatas.cloneTo(dest._defineDatas);
        // this._gammaColorMap.forEach((color, index) => {
        //     destObject._gammaColorMap.set(index, color.clone());
        // })
        this._nativeObj.cloneTo(destObject._nativeObj);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: NativeShaderData = new NativeShaderData();
        this.cloneTo(dest);
        return dest;
    }
    destroy(): void {
        super.destroy();
        this._nativeObj.destroy();
        this._nativeObj = null;
    }
}