import { BaseTexture } from "../../resource/BaseTexture";
import { Resource } from "../../resource/Resource";
import { DefineDatas } from "./DefineDatas";
import { ShaderDefine } from "./ShaderDefine";
import { Texture2D } from "../../resource/Texture2D";
import { IClone } from "../../d3/core/IClone";
import { Matrix4x4 } from "../../d3/math/Matrix4x4";
import { Quaternion } from "../../d3/math/Quaternion";
import { Vector2 } from "../../d3/math/Vector2";
import { Vector3 } from "../../d3/math/Vector3";
import { Vector4 } from "../../d3/math/Vector4";


/**
 * 着色器数据类。
 */
export class ShaderData implements IClone {
	/**@internal */
	protected _ownerResource: Resource = null;
	/**@internal */
	 _data: any = null;

	/** @internal */
	_defineDatas: DefineDatas = new DefineDatas();

	/**
	 * @internal	
	 */
	constructor(ownerResource: Resource = null) {
		this._ownerResource = ownerResource;
		this._initData();
	}

	/**
	 * @internal
	 */
	_initData(): void {
		this._data = {};
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
		if(this._data[index]){
			value.cloneTo(this._data[index]);
		}else
			this._data[index] = value.clone();
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
		if(this._data[index]){
			value.cloneTo(this._data[index]);
		}else
			this._data[index] = value.clone();
	}

	/**
	 * 获取颜色。
	 * @param	index shader索引。
	 * @return 颜色向量。
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
		if(this._data[index]){
			value.cloneTo(this._data[index]);
		}else
			this._data[index] = value.clone();
	}

	/**
	 * 获取四元数。
	 * @param	index shader索引。
	 * @return 四元。
	 */
	getQuaternion(index: number): Quaternion {
		return this._data[index];
	}

	/**
	 * 设置四元数。
	 * @param	index shader索引。
	 * @param	value 四元数。
	 */
	setQuaternion(index: number, value: Quaternion): void {
		if(this._data[index]){
			value.cloneTo(this._data[index]);
		}else
			this._data[index] = value.clone();
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
		this._data[index] = value.clone();
	}

	/**
	 * 获取Buffer。
	 * @param	index shader索引。
	 * @return
	 */
	getBuffer(shaderIndex: number): Float32Array {
		return this._data[shaderIndex];
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
		this._data[index] = value ? value : Texture2D.erroTextur;
		if (this._ownerResource && this._ownerResource.referenceCount > 0) {
			(lastValue) && (lastValue._removeReference());
			(value) && (value._addReference());
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

	/**
	 * set shader data
	 * @param index uniformID
	 * @param value data
	 */
	setValueData(index: number, value: any) {
		if(!value)//value null
			this._data[index] = value;
		if(!!this._data[index]&&(!!value.cloneTo)){
			value.cloneTo(this._data[index]);
		}else if (!!value.clone){
			this._data[index] = value.clone();
		}else
			this._data[index] = value;
	}

	setBlockValueData(){
		//TODO
	}

	/**
	 * get shader data
	 * @param index uniform ID
	 * @returns 
	 */
	getValueData(index: number): any {
		return this._data[index];
	}

	// /**
	//  * 设置Attribute。
	//  * @param	index shader索引。
	//  * @param	value 纹理。
	//  */
	// setAttribute(index: number, value: Int32Array): void {
	// 	this._data[index] = value;
	// }

	// /**
	//  * 获取Attribute。
	//  * @param	index shader索引。
	//  * @return  纹理。
	//  */
	// getAttribute(index: number): any[] {
	// 	return this._data[index];
	// }

	/**
	 * 获取长度。
	 * @return 长度。
	 */
	getLength(): number {
		return this._data.length;
	}

	/**
	 * 设置长度。
	 * @param 长度。
	 */
	setLength(value: number): void {
		this._data.length = value;
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
					var v4 = (destData[k]) || (destData[k] = new Vector4());
					((<Vector4>value)).cloneTo(v4);
					destData[k] = v4;
				} else if (value instanceof Matrix4x4) {
					var mat = (destData[k]) || (destData[k] = new Matrix4x4());
					((<Matrix4x4>value)).cloneTo(mat);
					destData[k] = mat;
				} else if (value instanceof BaseTexture) {
					destData[k] = value;
				}
			}
		}
		this._defineDatas.cloneTo(dest._defineDatas);
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
}

