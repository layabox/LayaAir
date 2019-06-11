import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { LayaGL } from "laya/layagl/LayaGL";
import { BaseTexture } from "laya/resource/BaseTexture";
/**
 * @private
 */
export class ShaderData {
    /**
     * @private
     */
    constructor(ownerResource = null) {
        /**@private */
        this._ownerResource = null;
        /**@private */
        this._data = null;
        /** @private */
        this._defineValue = 0;
        /**@private [NATIVE]*/
        this._runtimeCopyValues = [];
        this._ownerResource = ownerResource;
        this._initData();
    }
    /**
     * @private
     */
    _initData() {
        this._data = new Object();
    }
    /**
     * @private
     */
    getData() {
        return this._data;
    }
    /**
     * 增加Shader宏定义。
     * @param value 宏定义。
     */
    addDefine(define) {
        this._defineValue |= define;
    }
    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define) {
        this._defineValue &= ~define;
    }
    /**
     * 是否包含Shader宏定义。
     * @param value 宏定义。
     */
    hasDefine(define) {
        return (this._defineValue & define) > 0;
    }
    /**
     * 清空宏定义。
     */
    clearDefine() {
        this._defineValue = 0;
    }
    /**
     * 获取布尔。
     * @param	index shader索引。
     * @return  布尔。
     */
    getBool(index) {
        return this._data[index];
    }
    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取整形。
     * @param	index shader索引。
     * @return  整形。
     */
    getInt(index) {
        return this._data[index];
    }
    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取浮点。
     * @param	index shader索引。
     * @return  浮点。
     */
    getNumber(index) {
        return this._data[index];
    }
    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取Vector2向量。
     * @param	index shader索引。
     * @return Vector2向量。
     */
    getVector2(index) {
        return this._data[index];
    }
    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取Vector3向量。
     * @param	index shader索引。
     * @return Vector3向量。
     */
    getVector3(index) {
        return this._data[index];
    }
    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取颜色。
     * @param	index shader索引。
     * @return 颜色向量。
     */
    getVector(index) {
        return this._data[index];
    }
    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取四元数。
     * @param	index shader索引。
     * @return 四元。
     */
    getQuaternion(index) {
        return this._data[index];
    }
    /**
     * 设置四元数。
     * @param	index shader索引。
     * @param	value 四元数。
     */
    setQuaternion(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取矩阵。
     * @param	index shader索引。
     * @return  矩阵。
     */
    getMatrix4x4(index) {
        return this._data[index];
    }
    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取Buffer。
     * @param	index shader索引。
     * @return
     */
    getBuffer(shaderIndex) {
        return this._data[shaderIndex];
    }
    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index, value) {
        this._data[index] = value;
    }
    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index, value) {
        var lastValue = this._data[index];
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
    getTexture(index) {
        return this._data[index];
    }
    /**
     * 设置Attribute。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setAttribute(index, value) {
        this._data[index] = value;
    }
    /**
     * 获取Attribute。
     * @param	index shader索引。
     * @return  纹理。
     */
    getAttribute(index) {
        return this._data[index];
    }
    /**
     * 获取长度。
     * @return 长度。
     */
    getLength() {
        return this._data.length;
    }
    /**
     * 设置长度。
     * @param 长度。
     */
    setLength(value) {
        this._data.length = value;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var dest = destObject;
        var destData = dest._data;
        for (var k in this._data) { //TODO:需要优化,杜绝is判断，慢
            var value = this._data[k];
            if (value != null) {
                if (typeof (value) == 'number') {
                    destData[k] = value;
                }
                else if (typeof (value) == 'number') {
                    destData[k] = value;
                }
                else if (typeof (value) == "boolean") {
                    destData[k] = value;
                }
                else if (value instanceof Vector2) {
                    var v2 = (destData[k]) || (destData[k] = new Vector2());
                    value.cloneTo(v2);
                    destData[k] = v2;
                }
                else if (value instanceof Vector3) {
                    var v3 = (destData[k]) || (destData[k] = new Vector3());
                    value.cloneTo(v3);
                    destData[k] = v3;
                }
                else if (value instanceof Vector4) {
                    var v4 = (destData[k]) || (destData[k] = new Vector4());
                    value.cloneTo(v4);
                    destData[k] = v4;
                }
                else if (value instanceof Matrix4x4) {
                    var mat = (destData[k]) || (destData[k] = new Matrix4x4());
                    value.cloneTo(mat);
                    destData[k] = mat;
                }
                else if (value instanceof BaseTexture) {
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
    clone() {
        var dest = new ShaderData();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneToForNative(destObject) {
        var dest = destObject;
        var diffSize = this._int32Data.length - dest._int32Data.length;
        if (diffSize > 0) {
            dest.needRenewArrayBufferForNative(this._int32Data.length);
        }
        dest._int32Data.set(this._int32Data, 0);
        var destData = dest._nativeArray;
        var dataCount = this._nativeArray.length;
        destData.length = dataCount; //TODO:runtime
        for (var i = 0; i < dataCount; i++) { //TODO:需要优化,杜绝is判断，慢
            var value = this._nativeArray[i];
            if (value) {
                if (typeof (value) == 'number') {
                    destData[i] = value;
                    dest.setNumber(i, value);
                }
                else if (typeof (value) == 'number') {
                    destData[i] = value;
                    dest.setInt(i, value);
                }
                else if (typeof (value) == "boolean") {
                    destData[i] = value;
                    dest.setBool(i, value);
                }
                else if (value instanceof Vector2) {
                    var v2 = (destData[i]) || (destData[i] = new Vector2());
                    value.cloneTo(v2);
                    destData[i] = v2;
                    dest.setVector2(i, v2);
                }
                else if (value instanceof Vector3) {
                    var v3 = (destData[i]) || (destData[i] = new Vector3());
                    value.cloneTo(v3);
                    destData[i] = v3;
                    dest.setVector3(i, v3);
                }
                else if (value instanceof Vector4) {
                    var v4 = (destData[i]) || (destData[i] = new Vector4());
                    value.cloneTo(v4);
                    destData[i] = v4;
                    dest.setVector(i, v4);
                }
                else if (value instanceof Matrix4x4) {
                    var mat = (destData[i]) || (destData[i] = new Matrix4x4());
                    value.cloneTo(mat);
                    destData[i] = mat;
                    dest.setMatrix4x4(i, mat);
                }
                else if (value instanceof BaseTexture) {
                    destData[i] = value;
                    dest.setTexture(i, value);
                }
            }
        }
    }
    /**
     * @private [NATIVE]
     */
    _initDataForNative() {
        var length = 8; //默认分配8个
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
    needRenewArrayBufferForNative(index) {
        if (index >= this._int32Data.length) {
            var nByteLen = (index + 1) * 4;
            var pre = this._int32Data;
            var preConchRef = this._data["conchRef"];
            var prePtrID = this._data["_ptrID"];
            this._data = new ArrayBuffer(nByteLen);
            this._int32Data = new Int32Array(this._data);
            this._float32Data = new Float32Array(this._data);
            this._data["conchRef"] = preConchRef;
            this._data["_ptrID"] = prePtrID;
            pre && this._int32Data.set(pre, 0);
            window.conch.updateArrayBufferRef(this._data['_ptrID'], preConchRef.isSyncToRender(), this._data);
        }
    }
    getDataForNative() {
        return this._nativeArray;
    }
    /**
     *@private [NATIVE]
     */
    getIntForNative(index) {
        return this._int32Data[index];
    }
    /**
     *@private [NATIVE]
     */
    setIntForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._int32Data[index] = value;
        this._nativeArray[index] = value;
    }
    /**
     *@private [NATIVE]
     */
    getBoolForNative(index) {
        return this._int32Data[index] == 1;
    }
    /**
     *@private [NATIVE]
     */
    setBoolForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._int32Data[index] = value ? 1 : 0;
        this._nativeArray[index] = value;
    }
    /**
     *@private [NATIVE]
     */
    getNumberForNative(index) {
        return this._float32Data[index];
    }
    /**
     *@private [NATIVE]
     */
    setNumberForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._float32Data[index] = value;
        this._nativeArray[index] = value;
    }
    /**
     *@private [NATIVE]
     */
    getMatrix4x4ForNative(index) {
        return this._nativeArray[index];
    }
    /**
     *@private [NATIVE]
     */
    setMatrix4x4ForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value; //保存引用
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    /**
     *@private [NATIVE]
     */
    getVectorForNative(index) {
        return this._nativeArray[index];
    }
    /**
     *@private [NATIVE]
     */
    setVectorForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value; //保存引用
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    /**
     *@private [NATIVE]
     */
    getVector2ForNative(index) {
        return this._nativeArray[index];
    }
    /**
     *@private [NATIVE]
     */
    setVector2ForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value; //保存引用
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    /**
     *@private [NATIVE]
     */
    getVector3ForNative(index) {
        return this._nativeArray[index];
    }
    /**
     *@private [NATIVE]
     */
    setVector3ForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value; //保存引用
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    /**
     *@private [NATIVE]
     */
    getQuaternionForNative(index) {
        return this._nativeArray[index];
    }
    /**
     *@private [NATIVE]
     */
    setQuaternionForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value; //保存引用
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    /**
     *@private [NATIVE]
     */
    getBufferForNative(shaderIndex) {
        return this._nativeArray[shaderIndex];
    }
    /**
     *@private [NATIVE]
     */
    setBufferForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value; //保存引用
        var nPtrID = this.setReferenceForNative(value);
        this._int32Data[index] = nPtrID;
    }
    /**
     *@private [NATIVE]
     */
    getAttributeForNative(index) {
        return this._nativeArray[index];
    }
    /**
     *@private [NATIVE]
     */
    setAttributeForNative(index, value) {
        this._nativeArray[index] = value; //保存引用
        if (!value["_ptrID"]) {
            LayaGL.createArrayBufferRef(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true);
        }
        LayaGL.syncBufferToRenderThread(value);
        this._int32Data[index] = value["_ptrID"];
    }
    /**
     *@private [NATIVE]
     */
    getTextureForNative(index) {
        return this._nativeArray[index];
    }
    /**
     *@private [NATIVE]
     */
    setTextureForNative(index, value) {
        if (!value)
            return;
        this.needRenewArrayBufferForNative(index);
        var lastValue = this._nativeArray[index];
        this._nativeArray[index] = value; //保存引用
        this._int32Data[index] = value._glTexture.id;
        if (this._ownerResource && this._ownerResource.referenceCount > 0) {
            (lastValue) && (lastValue._removeReference());
            (value) && (value._addReference());
        }
    }
    setReferenceForNative(value) {
        //清空保存的数据
        this.clearRuntimeCopyArray();
        var nRefID = 0;
        var nPtrID = 0;
        if (ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_) {
            LayaGL.createArrayBufferRefs(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true, LayaGL.ARRAY_BUFFER_REF_REFERENCE);
            nRefID = 0;
            nPtrID = value.getPtrID(nRefID);
        }
        else {
            LayaGL.createArrayBufferRefs(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true, LayaGL.ARRAY_BUFFER_REF_COPY);
            nRefID = value.getRefNum() - 1;
            nPtrID = value.getPtrID(nRefID);
            //TODO 应该只用到value
            this._runtimeCopyValues.push({ "obj": value, "refID": nRefID, "ptrID": nPtrID });
        }
        LayaGL.syncBufferToRenderThread(value, nRefID);
        return nPtrID;
    }
    static setRuntimeValueMode(bReference) {
        ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_ = bReference;
    }
    clearRuntimeCopyArray() {
        var currentFrame = LayaGL.getFrameCount();
        if (this._frameCount != currentFrame) {
            this._frameCount = currentFrame;
            for (var i = 0, n = this._runtimeCopyValues.length; i < n; i++) {
                var obj = this._runtimeCopyValues[i];
                obj.obj.clearRefNum();
            }
            this._runtimeCopyValues.length = 0;
        }
    }
}
/**@private [NATIVE]*/
ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_ = true;
