import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData"
import { GLESShaderData } from "../../OpenglESDriver/RenderDevice/GLESShaderData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUSubUniformBlockBuffer, WebGPUUniformBlockBuffer, WebGPUUniformBlockLayout } from "./WebGPUUniformBlockBuffer";
export interface WebGPUShaderDataUBOProperty {
    layout: WebGPUUniformBlockLayout;
    subBuffer: WebGPUSubUniformBlockBuffer;
}

export class WebGPUShaderData extends ShaderData {

    /**@internal */
    _defineDatas: WebDefineDatas;
    /**@internal */
    _data: any = null;
    /**@internal */
    protected _gammaColorMap: Map<number, Color>;
    //每一个UniformPorperty对应的block
    _uboPropertyMap: Map<number, WebGPUShaderDataUBOProperty>;
    //shaderData里面需要绑定的的Ubo集合
    _uboBlockMap: Map<number, WebGPUShaderDataUBOProperty>;
    constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._defineDatas = new WebDefineDatas();
        this._uboPropertyMap = new Map();
    }

    /**
     * 设置shaderData绑定某个UniformBlockLayout
     * @param blockLayoutt 
     */
    _setUniformBlockLayout(blockLayoutt: WebGPUUniformBlockLayout) {
        let blockProperty: WebGPUShaderDataUBOProperty = this._uboBlockMap.get(blockLayoutt.UniformBlockID);
        if (!blockProperty) {//创建WebGPUShaderDataUBOProperty
            let uboBlockBuffer = WebGPUUniformBlockBuffer._map[blockLayoutt.UniformBlockID];
            let subUniformBuffer = uboBlockBuffer.getSubUbOBuffer();
            this._uboPropertyMap.set(blockLayoutt.UniformBlockID, { layout: blockLayoutt, subBuffer: subUniformBuffer });
            blockProperty = this._uboPropertyMap.get(blockLayoutt.UniformBlockID);
        }
        //绑定shaderData数据
        for (var i in blockProperty.layout.propertyIDs) {
            this._uboPropertyMap.set(parseInt(i), blockProperty);
        }
        blockProperty.subBuffer.needUpdata = true;//设置subBuffer需要更新
    }

    /**
    * 增加Shader宏定义。
    * @param value 宏定义。
    */
    addDefine(define: ShaderDefine): void {
        this._defineDatas.add(define);
    }

    addDefines(define: WebDefineDatas): void {
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
        this._defineDatas.clear();
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
        if (this._data[index] == value)
            return;
        this._data[index] = value;
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        if (this._data[index] == value)
            return;
        this._data[index] = value;
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        if (this._data[index] == value)
            return;
        this._data[index] = value;
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        let v2 = this._data[index]
        if (v2) {
            if (Vector2.equals(v2, value)) return;
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        let v3 = this._data[index]
        if (v3) {
            if (Vector3.equals(v3, value)) return;
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        let v4 = this._data[index]
        if (v4) {
            if (Vector4.equals(v4, value)) return;
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
            if ((this._data[index] as Color).equal(gammaColor))
                return;
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
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        let mat = this._data[index] as Matrix4x4;
        if (mat) {
            if (mat.equalsOtherMatrix(value)) return;
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        let mat = this._data[index] as Matrix3x3;
        if (mat) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
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
        this._uboPropertyMap.get(index)?.subBuffer.markChangeProperty(index);
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._data[index];
		if (value) {
			let shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
			if (shaderDefine && value && value.gammaCorrection > 1) {
				this.addDefine(shaderDefine);
			}
			else {
				shaderDefine && this.removeDefine(shaderDefine);
			}
		}
		//维护Reference
		this._data[index] = value;
		lastValue && lastValue._removeReference();
		value && value._addReference();
    }

    /**@internal */
    _setInternalTexture(index: number, value: InternalTexture) {
        var lastValue: InternalTexture = this._data[index];
		if (value) {
			let shaderDefine =  WebGPURenderEngine._instance._texGammaDefine[index];
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
    }

    /**
     * 获取纹理。
     * @param	index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture {
        return  this._data[index];
    }

    getSourceIndex(value: any): number {
        for (var i in this._data) {
			if (this._data[i] == value)
				return Number(i);
		}
		return -1;
    }

    cloneTo(destObject: GLESShaderData): void {
        //TODO
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
        //TODO
    }
}