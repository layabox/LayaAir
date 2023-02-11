import { BaseTexture } from "../../resource/BaseTexture";
import { Resource } from "../../resource/Resource";
import { DefineDatas } from "./DefineDatas";
import { ShaderDefine } from "./ShaderDefine";
import { Texture2D } from "../../resource/Texture2D";
import { IClone } from "../../utils/IClone";
import { UniformBufferObject } from "../UniformBufferObject";
import { UniformBufferParamsType, UnifromBufferData } from "../UniformBufferData";
import { Color } from "../../maths/Color";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";

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
	Buffer
}

export type ShaderDataItem = number | boolean | Vector2 | Vector3 | Vector4 | Color | Matrix4x4 | BaseTexture | Float32Array;

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
	}
	return null;
}

/**
 * 着色器数据类。
 */
export class ShaderData implements IClone {
	/**@internal 反向找Material*/
	protected _ownerResource: Resource = null;

	/**@internal */
	protected _gammaColorMap: Map<number, Color>;

	/**@internal */
	_data: any = null;

	/** @internal */
	_defineDatas: DefineDatas = new DefineDatas();

	/**@internal */
	_uniformBufferDatas: Map<string, UniformBufferObject>;

	/**
	 * @internal
	 * key: uniform property id
	 * value: UniformBufferObject
	 * 保存 每个 uniform id 所在的 ubo
	 */
	_uniformBuffersMap: Map<number, UniformBufferObject>;

	/**
	 * @internal
	 */
	get uniformBufferDatas() {
		return this._uniformBufferDatas;
	}

	get uniformBuffersMap(): Map<number, UniformBufferObject> {
		return this._uniformBuffersMap;
	}



	/**
	 * @internal	
	 */
	constructor(ownerResource: Resource = null) {
		this._ownerResource = ownerResource;
		this._initData();

		this._uniformBufferDatas = new Map();
		this._uniformBuffersMap = new Map();
	}

	/**
	 * @internal
	 * @param key 
	 * @param ubo 
	 * @param uboData 
	 */
	_addCheckUBO(key: string, ubo: UniformBufferObject, uboData: UnifromBufferData) {
		this._uniformBufferDatas.set(key, ubo);
		uboData._uniformParamsState.forEach((value: UniformBufferParamsType, id: number) => {
			this.uniformBuffersMap.set(id, ubo);
		});
		ubo.setDataByUniformBufferData(uboData);
	}

	/**
	 * @internal
	 */
	_initData(): void {
		this._data = {};
		this._gammaColorMap = new Map();
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
		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getInt(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
		}
	}

	/**
	 * 获取浮点。
	 * @param	index shader索引。
	 * @return  浮点。
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
		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getNumber(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
		}
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
		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getVector2(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
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
		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getVector3(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
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
		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getVector(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
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
		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getLinearColor(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
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

		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getVector(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
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
	}

	/**
	 * 设置纹理。
	 * @param	index shader索引。
	 * @param	value 纹理。
	 */
	setTexture(index: number, value: BaseTexture): void {
		var lastValue: BaseTexture = this._data[index];
		if (value) {
			let shaderDefine = ShaderDefine._texGammaDefine[index];
			if (shaderDefine && value && value.gammaCorrection > 1) {
				this.addDefine(shaderDefine);
			}
			else {
				// todo 自动的
				shaderDefine && this.removeDefine(shaderDefine);
			}
		}
		//维护Reference
		this._data[index] = value ? value : Texture2D.erroTextur;
		(lastValue) && (lastValue._removeReference());
		(value) && (value._addReference());	
	}
	/**
	 * 获取纹理。
	 * @param	index shader索引。
	 * @return  纹理。
	 */
	getTexture(index: number): BaseTexture {
		return this._data[index];
	}

	getSourceIndex(value:any){
		for(var i in this._data){
			if(this._data[i]==value)
				return Number(i);
		}
		return -1;
	}

	/**
	 * set shader data
	 * @deprecated
	 * @param index uniformID
	 * @param value data
	 */
	setValueData(index: number, value: any) {
		//Color 需要特殊处理
		if (value instanceof Color) {
			this.setColor(index, value);
			return;
		} else if (!value) {//value null
			this._data[index] = value;
		}
		else if (!!value.clone) {
			this._data[index] = value.clone();
		} else
			this._data[index] = value;

		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			ubo._updateDataInfo._setData(index, this.getValueData(index));
			ubo.setDataByUniformBufferData(ubo._updateDataInfo);
		}
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
			case ShaderDataType.Texture2D:
			case ShaderDataType.TextureCube:
				this.setTexture(uniformIndex, <BaseTexture>value);
				break;
			case ShaderDataType.Buffer:
				this.setBuffer(uniformIndex, <Float32Array>value);
				break;
			default:
				throw "unkone shader data type.";
		}
	}

	getShaderData(uniformIndex: number, type: ShaderDataType) {
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
			default:
				throw "unkone shader data type.";
		}
	}

	/**
	 * get shader data
	 * @deprecated
	 * @param index uniform ID
	 * @returns 
	 */
	getValueData(index: number): any {
		return this._data[index];
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: ShaderData): void {
		var dest: ShaderData = <ShaderData>destObject;
		var destData: { [key: string]: number | boolean | Vector2 | Vector3 | Vector4 | Matrix4x4 | BaseTexture } = dest._data;
		for (var k in this._data) {//TODO:需要优化,杜绝is判断，慢
			var value: any = this._data[k];
			if (value != null) {
				if (typeof (value) == 'number') {
					destData[k] = value;
				} else if (typeof (value) == 'number') {
					destData[k] = value;
				} else if (typeof (value) == "boolean") {
					destData[k] = value;
				} else if (value instanceof Vector2) {
					var v2 = (destData[k]) || (destData[k] = new Vector2());
					((<Vector2>value)).cloneTo(v2);
					destData[k] = v2;
				} else if (value instanceof Vector3) {
					var v3 = (destData[k]) || (destData[k] = new Vector3());
					((<Vector3>value)).cloneTo(v3);
					destData[k] = v3;
				} else if (value instanceof Vector4) {
					let color = this.getColor(parseInt(k));
					if (color) {
						let clonecolor = color.clone();
						destObject.setColor(parseInt(k), clonecolor);
					} else {
						var v4 = (destData[k]) || (destData[k] = new Vector4());
						((<Vector4>value)).cloneTo(v4);
						destData[k] = v4;
					}

				} else if (value instanceof Matrix4x4) {
					var mat = (destData[k]) || (destData[k] = new Matrix4x4());
					((<Matrix4x4>value)).cloneTo(mat);
					destData[k] = mat;
				} else if (value instanceof BaseTexture) {
					destData[k] = value;
					value._addReference();

				}
			}
		}
		this._defineDatas.cloneTo(dest._defineDatas);
		this._gammaColorMap.forEach((color, index) => {
			destObject._gammaColorMap.set(index, color.clone());
		})

	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: ShaderData = new ShaderData();
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
		this._gammaColorMap.clear();
		this._uniformBufferDatas.clear();
		this._uniformBuffersMap.clear();
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
		this._gammaColorMap.clear();
		this._gammaColorMap = null;
		// // 使用对象解析
		delete this._uniformBufferDatas;
		delete this._uniformBuffersMap;
		this._uniformBufferDatas = null;
		this._uniformBuffersMap = null;

	}
}

