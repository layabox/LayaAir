import { IClone } from "../core/IClone"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Quaternion } from "../math/Quaternion"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Vector4 } from "../math/Vector4"
import { LayaGL } from "../../layagl/LayaGL"
import { Resource } from "../../resource/Resource"
import { BaseTexture } from "../../resource/BaseTexture"

/**
 * @private
 */
export class ShaderData implements IClone {
	/**@private */
	private _ownerResource: Resource = null;
	/**@private */
	private _data: any = null;
	/** @private */
	_defineValue: number = 0;

	/**
	 * @private
	 */
	constructor(ownerResource: Resource = null) {
		this._ownerResource = ownerResource;
		this._initData();
	}

	/**
	 * @private
	 */
	_initData(): void {
		this._data = new Object();
	}

	/**
	 * @private
	 */
	getData(): any {
		return this._data;
	}

	/**
	 * 增加Shader宏定义。
	 * @param value 宏定义。
	 */
	addDefine(define: number): void {
		this._defineValue |= define;
	}

	/**
	 * 移除Shader宏定义。
	 * @param value 宏定义。
	 */
	removeDefine(define: number): void {
		this._defineValue &= ~define;
	}

	/**
	 * 是否包含Shader宏定义。
	 * @param value 宏定义。
	 */
	hasDefine(define: number): boolean {
		return (this._defineValue & define) > 0;
	}

	/**
	 * 清空宏定义。
	 */
	clearDefine(): void {
		this._defineValue = 0;
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
		this._data[index] = value;
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
		this._data[index] = value;
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
	 * 设置Attribute。
	 * @param	index shader索引。
	 * @param	value 纹理。
	 */
	setAttribute(index: number, value: Int32Array): void {
		this._data[index] = value;
	}

	/**
	 * 获取Attribute。
	 * @param	index shader索引。
	 * @return  纹理。
	 */
	getAttribute(index: number): any[] {
		return this._data[index];
	}

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
	cloneTo(destObject: any): void {
		var dest: ShaderData = (<ShaderData>destObject);
		var destData: any[] = dest._data;
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
					var v2: Vector2 = (destData[k]) || (destData[k] = new Vector2());
					((<Vector2>value)).cloneTo(v2);
					destData[k] = v2;
				} else if (value instanceof Vector3) {
					var v3: Vector3 = (destData[k]) || (destData[k] = new Vector3());
					((<Vector3>value)).cloneTo(v3);
					destData[k] = v3;
				} else if (value instanceof Vector4) {
					var v4: Vector4 = (destData[k]) || (destData[k] = new Vector4());
					((<Vector4>value)).cloneTo(v4);
					destData[k] = v4;
				} else if (value instanceof Matrix4x4) {
					var mat: Matrix4x4 = (destData[k]) || (destData[k] = new Matrix4x4());
					((<Matrix4x4>value)).cloneTo(mat);
					destData[k] = mat;
				} else if (value instanceof BaseTexture) {
					destData[k] = value;
				}
			}
		}
		dest._defineValue = this._defineValue;
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

	//------------------------------------------------------------------------------------------------------------------------------------

	/**@private [NATIVE]*/
	private _int32Data: Int32Array;
	/**@private [NATIVE]*/
	private _float32Data: Float32Array;
	/**@private [NATIVE]*/
	_nativeArray: any[];
	/**@private [NATIVE]*/
	_frameCount: number;
	/**@private [NATIVE]*/
	static _SET_RUNTIME_VALUE_MODE_REFERENCE_: boolean = true;
	/**@private [NATIVE]*/
	_runtimeCopyValues: any[] = [];

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneToForNative(destObject: any): void {
		var dest: ShaderData = (<ShaderData>destObject);

		var diffSize: number = this._int32Data.length - dest._int32Data.length;
		if (diffSize > 0) {
			dest.needRenewArrayBufferForNative(this._int32Data.length);
		}

		dest._int32Data.set(this._int32Data, 0);
		var destData: any[] = dest._nativeArray;
		var dataCount: number = this._nativeArray.length;
		destData.length = dataCount;//TODO:runtime
		for (var i: number = 0; i < dataCount; i++) {//TODO:需要优化,杜绝is判断，慢
			var value: any = this._nativeArray[i];
			if (value) {
				if (typeof (value) == 'number') {
					destData[i] = value;
					dest.setNumber(i, value);
				} else if (typeof (value) == 'number') {
					destData[i] = value;
					dest.setInt(i, value);
				} else if (typeof (value) == "boolean") {
					destData[i] = value;
					dest.setBool(i, value);
				} else if (value instanceof Vector2) {
					var v2: Vector2 = (destData[i]) || (destData[i] = new Vector2());
					((<Vector2>value)).cloneTo(v2);
					destData[i] = v2;
					dest.setVector2(i, v2);
				} else if (value instanceof Vector3) {
					var v3: Vector3 = (destData[i]) || (destData[i] = new Vector3());
					((<Vector3>value)).cloneTo(v3);
					destData[i] = v3;
					dest.setVector3(i, v3);
				} else if (value instanceof Vector4) {
					var v4: Vector4 = (destData[i]) || (destData[i] = new Vector4());
					((<Vector4>value)).cloneTo(v4);
					destData[i] = v4;
					dest.setVector(i, v4);
				} else if (value instanceof Matrix4x4) {
					var mat: Matrix4x4 = (destData[i]) || (destData[i] = new Matrix4x4());
					((<Matrix4x4>value)).cloneTo(mat);
					destData[i] = mat;
					dest.setMatrix4x4(i, mat);
				} else if (value instanceof BaseTexture) {
					destData[i] = value;
					dest.setTexture(i, value);
				}
			}
		}
	}

	/**
	 * @private [NATIVE]
	 */
	_initDataForNative(): void {
		var length: number = 8;//默认分配8个
		if (!length) {
			alert("ShaderData _initDataForNative error length=0");
		}
		this._frameCount = -1;
		this._runtimeCopyValues.length = 0;
		this._nativeArray = [];
		this._data = new ArrayBuffer(length * 4);
		this._int32Data = new Int32Array(this._data);
		this._float32Data = new Float32Array(this._data);
		LayaGL.createArrayBufferRef(this._data, LayaGL.ARRAY_BUFFER_TYPE_DATA, true);
	}

	needRenewArrayBufferForNative(index: number): void {
		if (index >= this._int32Data.length) {
			var nByteLen: number = (index + 1) * 4;
			var pre: Int32Array = this._int32Data;
			var preConchRef: any = this._data["conchRef"];
			var prePtrID: number = this._data["_ptrID"];
			this._data = new ArrayBuffer(nByteLen);
			this._int32Data = new Int32Array(this._data);
			this._float32Data = new Float32Array(this._data);
			this._data["conchRef"] = preConchRef;
			this._data["_ptrID"] = prePtrID;
			pre && this._int32Data.set(pre, 0);
			(<any>window).conch.updateArrayBufferRef(this._data['_ptrID'], preConchRef.isSyncToRender(), this._data);
		}
	}

	getDataForNative(): any[] {//[NATIVE]
		return this._nativeArray;
	}

	/**
	 *@private [NATIVE]
	 */
	getIntForNative(index: number): number {//[NATIVE]
		return this._int32Data[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setIntForNative(index: number, value: number): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._int32Data[index] = value;
		this._nativeArray[index] = value;
	}

	/**
	 *@private [NATIVE]
	 */
	getBoolForNative(index: number): boolean {//[NATIVE]
		return this._int32Data[index] == 1;
	}

	/**
	 *@private [NATIVE]
	 */
	setBoolForNative(index: number, value: boolean): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._int32Data[index] = value ? 1 : 0;
		this._nativeArray[index] = value;
	}

	/**
	 *@private [NATIVE]
	 */
	getNumberForNative(index: number): number {//[NATIVE]
		return this._float32Data[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setNumberForNative(index: number, value: number): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._float32Data[index] = value;
		this._nativeArray[index] = value;
	}

	/**
	 *@private [NATIVE]
	 */
	getMatrix4x4ForNative(index: number): Matrix4x4 {//[NATIVE]
		return this._nativeArray[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setMatrix4x4ForNative(index: number, value: Matrix4x4): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._nativeArray[index] = value;//保存引用
		var nPtrID: number = this.setReferenceForNative(value.elements);
		this._int32Data[index] = nPtrID;
	}

	/**
	 *@private [NATIVE]
	 */
	getVectorForNative(index: number): any {//[NATIVE]
		return this._nativeArray[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setVectorForNative(index: number, value: any): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._nativeArray[index] = value;//保存引用
		if (!value.elements) {
			value.forNativeElement();
		}
		var nPtrID: number = this.setReferenceForNative(value.elements);
		this._int32Data[index] = nPtrID;
	}

	/**
	 *@private [NATIVE]
	 */
	getVector2ForNative(index: number): any {//[NATIVE]
		return this._nativeArray[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setVector2ForNative(index: number, value: any): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._nativeArray[index] = value;//保存引用
		if (!value.elements) {
			value.forNativeElement();
		}
		var nPtrID: number = this.setReferenceForNative(value.elements);
		this._int32Data[index] = nPtrID;
	}

	/**
	 *@private [NATIVE]
	 */
	getVector3ForNative(index: number): any {//[NATIVE]
		return this._nativeArray[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setVector3ForNative(index: number, value: any): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._nativeArray[index] = value;//保存引用
		if (!value.elements) {
			value.forNativeElement();
		}
		var nPtrID: number = this.setReferenceForNative(value.elements);
		this._int32Data[index] = nPtrID;
	}

	/**
	 *@private [NATIVE]
	 */
	getQuaternionForNative(index: number): Quaternion {//[NATIVE]
		return this._nativeArray[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setQuaternionForNative(index: number, value: any): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._nativeArray[index] = value;//保存引用
		if (!value.elements) {
			value.forNativeElement();
		}
		var nPtrID: number = this.setReferenceForNative(value.elements);
		this._int32Data[index] = nPtrID;
	}

	/**
	 *@private [NATIVE]
	 */
	getBufferForNative(shaderIndex: number): Float32Array {//[NATIVE]
		return this._nativeArray[shaderIndex];
	}

	/**
	 *@private [NATIVE]
	 */
	setBufferForNative(index: number, value: Float32Array): void {//[NATIVE]
		this.needRenewArrayBufferForNative(index);
		this._nativeArray[index] = value;//保存引用
		var nPtrID: number = this.setReferenceForNative(value);
		this._int32Data[index] = nPtrID;
	}

	/**
	 *@private [NATIVE]
	 */
	getAttributeForNative(index: number): any[] {//[NATIVE]
		return this._nativeArray[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setAttributeForNative(index: number, value: Int32Array): void {//[NATIVE]
		this._nativeArray[index] = value;//保存引用
		if (!value["_ptrID"]) {
			LayaGL.createArrayBufferRef(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true);
		}
		LayaGL.syncBufferToRenderThread(value);
		this._int32Data[index] = value["_ptrID"];
	}

	/**
	 *@private [NATIVE]
	 */
	getTextureForNative(index: number): BaseTexture {//[NATIVE]
		return this._nativeArray[index];
	}

	/**
	 *@private [NATIVE]
	 */
	setTextureForNative(index: number, value: BaseTexture): void {//[NATIVE]
		if (!value) return;
		this.needRenewArrayBufferForNative(index);
		var lastValue: BaseTexture = this._nativeArray[index];
		this._nativeArray[index] = value;//保存引用
		this._int32Data[index] = ((<any>value))._glTexture.id;
		if (this._ownerResource && this._ownerResource.referenceCount > 0) {
			(lastValue) && (lastValue._removeReference());
			(value) && (value._addReference());
		}
	}

	setReferenceForNative(value: any): number {//[NATIVE]
		//清空保存的数据
		this.clearRuntimeCopyArray();
		var nRefID: number = 0;
		var nPtrID: number = 0;
		if (ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_) {
			LayaGL.createArrayBufferRefs(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true, LayaGL.ARRAY_BUFFER_REF_REFERENCE);
			nRefID = 0;
			nPtrID = value.getPtrID(nRefID);
		} else {
			LayaGL.createArrayBufferRefs(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true, LayaGL.ARRAY_BUFFER_REF_COPY);
			nRefID = value.getRefNum() - 1;
			nPtrID = value.getPtrID(nRefID);
			//TODO 应该只用到value
			this._runtimeCopyValues.push({ "obj": value, "refID": nRefID, "ptrID": nPtrID });
		}
		LayaGL.syncBufferToRenderThread(value, nRefID);
		return nPtrID;
	}

	static setRuntimeValueMode(bReference: boolean): void {//[NATIVE]
		ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_ = bReference;
	}

	clearRuntimeCopyArray(): void {
		var currentFrame: number = LayaGL.getFrameCount();
		if (this._frameCount != currentFrame) {
			this._frameCount = currentFrame;
			for (var i: number = 0, n: number = this._runtimeCopyValues.length; i < n; i++) {
				var obj: any = this._runtimeCopyValues[i];
				obj.obj.clearRefNum();
			}
			this._runtimeCopyValues.length = 0;
		}
	}
}

