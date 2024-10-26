import { UnifromBufferData, UniformBufferParamsType } from "../../../RenderEngine/UniformBufferData";
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
import { WebGLEngine } from "../../WebGLDriver/RenderDevice/WebGLEngine";
import { ShaderData, uboParams } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../Design/ShaderDefine";
import { WebDefineDatas } from "./WebDefineDatas";

/**
 * 着色器数据类。
 */
export class WebGLShaderData extends ShaderData {
	/**@internal */
	protected _gammaColorMap: Map<number, Color>;
	/**@internal */
	applyUBO: boolean = false;
	/**@internal */
	_data: any = null;

	/** @internal */
	_defineDatas: WebDefineDatas = new WebDefineDatas();

	/**@internal */
	_uniformBufferDatas: Map<string, uboParams>;

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

	_releaseUBOData() {
		if (!this._uniformBufferDatas) {
			return;
		}
		for (let value of this._uniformBufferDatas.values()) {
			value.ubo._updateDataInfo.destroy();
			value.ubo.destroy();
			value.ubo._updateDataInfo = null;
		}
		this._uniformBufferDatas.clear();
		this._uniformBuffersMap.clear();
	}

	/**
	 * @internal	
	 */
	constructor(ownerResource: Resource = null) {
		super(ownerResource);
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
		this._uniformBufferDatas.set(key, { ubo: ubo, uboBuffer: uboData });
		uboData._uniformParamsState.forEach(
			(value: UniformBufferParamsType, id: number) => {
				this.uniformBuffersMap.set(id, ubo);
			}
		);
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
	 * 注意!!!!!! 不要获得data之后直接设置值，设置值请使用set函数
	 * @internal
	 */
	getData(): any {
		return this._data;
	}

	applyUBOData() {
		this._uniformBufferDatas.forEach((value, key) => {
			value.ubo.setDataByUniformBufferData(value.uboBuffer);
		});
		this.applyUBO = false;
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
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getInt(index));
		}
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
		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getNumber(index));
			this.applyUBO = true;
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
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getVector2(index));
			this.applyUBO = true;
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
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getVector3(index));
			this.applyUBO = true;
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
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getVector(index));
			this.applyUBO = true;
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
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getLinearColor(index));
			this.applyUBO = true;

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
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getMatrix4x4(index));
			this.applyUBO = true;
		}
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
		if (this._data[index]) {
			value.cloneTo(this._data[index]);
		}
		else {
			this._data[index] = value.clone();
		}

		let ubo = this._uniformBuffersMap.get(index);
		if (ubo) {
			this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getMatrix3x3(index));
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
			let shaderDefine = WebGLEngine._texGammaDefine[index];
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
		lastValue && lastValue._removeReference();
		value && value._addReference();
	}

	_setInternalTexture(index: number, value: InternalTexture) {
		var lastValue: InternalTexture = this._data[index];
		if (value) {
			let shaderDefine = WebGLEngine._texGammaDefine[index];
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
		// lastValue && lastValue._removeReference();
		// value && value._addReference();
	}

	/**
	 * 获取纹理。
	 * @param	index shader索引。
	 * @return  纹理。
	 */
	getTexture(index: number): BaseTexture {
		return this._data[index];
	}

	getSourceIndex(value: any) {
		for (var i in this._data) {
			if (this._data[i] == value)
				return Number(i);
		}
		return -1;
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

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: WebGLShaderData): void {
		let destData: { [key: string]: number | boolean | Vector2 | Vector3 | Vector4 | Matrix3x3 | Matrix4x4 | Resource } = destObject._data;
		for (let k in this._data) {//TODO:需要优化,杜绝is判断，慢
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
		this._gammaColorMap.forEach((color, index) => {
			destObject._gammaColorMap.set(index, color.clone());
		});

		//UBO Clone
		this._cloneUBO(destObject._uniformBufferDatas);
		destObject.applyUBO = true;
	}

	getDefineData(): WebDefineDatas {
		return this._defineDatas;
	}

	/**
	 * clone UBO Data
	 * @internal
	 * @param uboDatas 
	 */
	_cloneUBO(uboDatas: Map<string, uboParams>) {
		this._uniformBufferDatas.forEach((value, key) => {
			uboDatas.has(key) && (value.uboBuffer.cloneTo(uboDatas.get(key).uboBuffer));
		});
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: WebGLShaderData = new WebGLShaderData();
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
		this.applyUBO = false;
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

