import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { RTDefineDatas } from "../../RenderModuleData/RuntimeModuleData/RTDefineDatas";
import { RTShaderDefine } from "../../RenderModuleData/RuntimeModuleData/RTShaderDefine";

export class GLESShaderData extends ShaderData {
    nativeObjID: number;
    _nativeObj: any;
    _defineDatas: RTDefineDatas = new RTDefineDatas();
    _textureData: { [key: number]: BaseTexture };
    _tempColor: Color = new Color();
    /**
     * @internal	
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource)
        this._nativeObj = new (window as any).conchGLESShaderData((this._defineDatas as any)._nativeObj);
        this._textureData = {};
    }

    // /**
    //  * @internal
    //  * 增加一个UBO Block
    //  * @param key 
    //  * @param ubo 
    //  * @param uboData 
    //  */
    // _addCheckUBO(key: string, ubo: UniformBufferObject, uboData: UnifromBufferData) {
    //     throw new Error("Method not implemented.");//TODO
    // }

    // _releaseUBOData() {
    //     throw new Error("Method not implemented.");//TODO
    // }

    /**
    * 
    * @param index 
    * @param value 
    */
    setUniformBuffer(index: number, value: UniformBufferObject) {
        //TODO
    }

    getUniformBuffer(index: number): UniformBufferObject {
        //throw new Error("Method not implemented.");
        //TODO
        return null;
    }

    getDefineData(): RTDefineDatas {
        return this._defineDatas;
    }

    /**
     * @internal
     */
    getData(): any {
        //TODO  想个方案
    }

    /**
     * 增加Shader宏定义。
     * @param value 宏定义。
     */
    addDefine(define: RTShaderDefine): void {
        this._defineDatas.add(define);
    }

    addDefines(define: RTDefineDatas): void {
        this._defineDatas.addDefineDatas(define);
    }

    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define: RTShaderDefine): void {
        this._defineDatas.remove(define);
    }

    /**
     * 是否包含Shader宏定义。
     * @param value 宏定义。
     */
    hasDefine(define: RTShaderDefine): boolean {
        return this._defineDatas.has(define);
    }

    /**
     * 清空宏定义。
     */
    clearDefine(): void {
        this._defineDatas.clear();
    }

    /**
     * 获取布尔。
     * @param	index shader索引。
     * @return  布尔。
     */
    getBool(index: number): boolean {
        return this._nativeObj.getBool(index);
    }

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        this._nativeObj.setBool(index, value);
    }

    /**
     * 获取整形。
     * @param	index shader索引。
     * @return  整形。
     */
    getInt(index: number): number {
        return this._nativeObj.getInt(index);
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        this._nativeObj.setInt(index, value);
    }

    /**
     * 获取浮点。
     * @param	index shader索引。
     * @return	浮点。
     */
    getNumber(index: number): number {
        return this._nativeObj.getNumber(index);
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        this._nativeObj.setNumber(index, value);
    }

    /**
     * 获取Vector2向量。
     * @param	index shader索引。
     * @return Vector2向量。
     */
    getVector2(index: number): Vector2 {
        return this._nativeObj.getVector2(index);
    }

    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        this._nativeObj.setVector2(index, value);
    }

    /**
     * 获取Vector3向量。
     * @param	index shader索引。
     * @return Vector3向量。
     */
    getVector3(index: number): Vector3 {
        return this._nativeObj.setVector3(index);
    }

    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        this._nativeObj.setVector3(index, value);
    }

    /**
     * 获取颜色。
     * @param 	index shader索引。
     * @return  向量。
     */
    getVector(index: number): Vector4 {
        return this._nativeObj.getVector(index);
    }

    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void {
        this._nativeObj.setVector(index, value);
    }

    /**
     * 获取颜色
     * @param index 索引
     * @returns 颜色
     */
    getColor(index: number): Color {
        let c = this._nativeObj.getColor(index);
        this._tempColor.r = c.r;
        this._tempColor.g = c.g;
        this._tempColor.b = c.b;
        this._tempColor.a = c.a;
        return this._tempColor;
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color): void {
        if (!value)
			return;
        this._nativeObj.setColor(index, value);
    }

    /**
     * 获取矩阵。
     * @param	index shader索引。
     * @return  矩阵。
     */
    getMatrix4x4(index: number): Matrix4x4 {
        return this._nativeObj.getMatrix4x4(index);
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        this._nativeObj.setMatrix4x4(index, value);
    }

    /**
     * 获取矩阵
     * @param index 
     * @returns 
     */
    getMatrix3x3(index: number): Matrix3x3 {
        return this._nativeObj.getMatrix3x3(index);
    }

    /**
     * 设置矩阵。
     * @param index 
     * @param value 
     */
    setMatrix3x3(index: number, value: Matrix3x3): void {
        this._nativeObj.setMatrix3x3(index, value);
    }

    /**
     * 获取Buffer。
     * @param	index shader索引。
     * @return
     */
    getBuffer(index: number): Float32Array {
        return null;
        //return this._nativeObj.getBuffer(index);
    }

    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._nativeObj.setBuffer(index,value);
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._textureData[index];
        //维护Reference
        this._textureData[index] = value;
        if (value) {
            this._setInternalTexture(index, value._texture);
        }
        lastValue && lastValue._removeReference();
        value && value._addReference();
    }

    /**@internal */
    _setInternalTexture(index: number, value: InternalTexture) {
        this._nativeObj._setInternalTexture(index, value);
    }

    /**
     * 获取纹理。
     * @param	index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture {
        return this._textureData[index];
    }

    getSourceIndex(value: any): number {
        throw new Error("Method not implemented.");
    }

    cloneTo(destObject: GLESShaderData): void {
       // this._nativeObj.cloneTo(destObject._nativeObj);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: GLESShaderData = new GLESShaderData();
        this.cloneTo(dest);
        return dest;
    }
    destroy(): void {
        super.destroy();
        this._nativeObj.destroy();
        this._nativeObj = null;
    }
}