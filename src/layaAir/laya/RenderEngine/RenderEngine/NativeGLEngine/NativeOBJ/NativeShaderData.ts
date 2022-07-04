import { Matrix4x4 } from "../../../../d3/math/Matrix4x4";
import { Quaternion } from "../../../../d3/math/Quaternion";
import { Vector2 } from "../../../../d3/math/Vector2";
import { Vector3 } from "../../../../d3/math/Vector3";
import { Vector4 } from "../../../../d3/math/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Resource } from "../../../../resource/Resource";
import { Texture2D } from "../../../../resource/Texture2D";
import { ShaderData } from "../../../RenderShader/ShaderData";
import { ShaderDefine } from "../../../RenderShader/ShaderDefine";
import { INativeUploadNode } from "../CommonMemory/INativeUploadNode";
import { MemoryDataType } from "../CommonMemory/MemoryDataType";
import { UploadMemory } from "../CommonMemory/UploadMemory";
import { UploadMemoryManager } from "../CommonMemory/UploadMemoryManager";

export enum NativeShaderDataType {
    Number32,
    Vector2,
    Vector3,
    Vector4,
    Matrix4x4,
    Number32Array,
    Texture,
    ShaderDefine,
}

export class NativeShaderData extends ShaderData implements INativeUploadNode {
    private inUploadList:boolean = false;
    _dataType: MemoryDataType;
    nativeObjID: number;
    _nativeObj: any;
    updateMap: Map<number, Function>;
    updataSizeMap: Map<number, number>;
    payload32bitNum: number = 0;
    /**
     * @internal	
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource)
        this._initData();
        this._nativeObj = new (window as any).conchShaderData();
        this.nativeObjID = this._nativeObj.nativeID;
        this._dataType = MemoryDataType.ShaderData;
        this.updateMap = new Map();
        this.updataSizeMap = new Map();
    }

    /**
     * @override interface INativeUploadNode
     * @internal
     */
    getUploadMemoryLength(): number {
        let head = 4;//header
        this.updataSizeMap.forEach((value) => {
            this.payload32bitNum += value;
        });
        return (this.payload32bitNum + head)* 4;
    }

    /**
     * @override interface INativeUploadNode
     * @internal
     * @param memoryBlock 
     * @param stride 
     */
    uploadDataTOShareMemory(memoryBlock: UploadMemory, strideInByte: number): boolean {
        if (!this._data) {
            return false;
        }
        let array = memoryBlock.int32Array;
        let strideFloat = strideInByte / 4;
        //type
         array[strideFloat++] = MemoryDataType.ShaderData;
        //instanceID
        array[strideFloat++] = this.nativeObjID;
        //dataLength
        array[strideFloat++] = this.payload32bitNum;
        //Shaderdata property change nums
        array[strideFloat++] = this.updateMap.size;
        this.updateMap.forEach((value, key) => {
            strideFloat += value.call(this, key, memoryBlock, strideFloat);
        });
        this.clearUpload();
        this.inUploadList = false;
        return true;
    }

    clearUpload() {
        this.payload32bitNum = 0;
        this.updataSizeMap.clear();
        this.updateMap.clear();
    }

    compressNumber(index: number, memoryBlock: UploadMemory, stride: number): number {
        //console.log("..index " + index + " NativeShaderDataType.Number32 " + NativeShaderDataType.Number32 + "stride " + stride);
        var length = 3;
        memoryBlock.int32Array[stride] = index;
        memoryBlock.int32Array[stride + 1] = NativeShaderDataType.Number32;
        memoryBlock.float32Array[stride + 2] = this._data[index];
        return length;
    }

    compressVector2(index: number, memoryBlock: UploadMemory, stride: number): number {
        //console.log("..index " + index + " NativeShaderDataType.Vector2 " + NativeShaderDataType.Vector2 + "stride " + stride);
        var length = 4;
        memoryBlock.int32Array[stride] = index;
        memoryBlock.int32Array[stride + 1] = NativeShaderDataType.Vector2;
        var value: Vector2 = this._data[index];
        memoryBlock.float32Array[stride + 2] = value.x;
        memoryBlock.float32Array[stride + 3] = value.y;
        return length;
    }

    compressVector3(index: number, memoryBlock: UploadMemory, stride: number): number {
        //console.log("..index " + index + " NativeShaderDataType.Vector3 " + NativeShaderDataType.Vector2 + "stride " + stride);
        var length = 5;
        memoryBlock.int32Array[stride] = index;
        memoryBlock.int32Array[stride + 1] = NativeShaderDataType.Vector3;
        var value: Vector3 = this._data[index];
        memoryBlock.float32Array[stride + 2] = value.x;
        memoryBlock.float32Array[stride + 3] = value.y;
        memoryBlock.float32Array[stride + 4] = value.z;
        return length;
    }

    compressVector4(index: number, memoryBlock: UploadMemory, stride: number): number {
        //console.log("..index " + index + " NativeShaderDataType.Vector4 " + NativeShaderDataType.Vector4 + "stride " + stride);
        var length = 6;
        memoryBlock.int32Array[stride] = index;
        memoryBlock.int32Array[stride + 1] = NativeShaderDataType.Vector4;
        var value: Vector4 = this._data[index];
        memoryBlock.float32Array[stride + 2] = value.x;
        memoryBlock.float32Array[stride + 3] = value.y;
        memoryBlock.float32Array[stride + 4] = value.z;
        memoryBlock.float32Array[stride + 5] = value.w;
        return length;
    }

    compressMatrix4x4(index: number, memoryBlock: UploadMemory, stride: number): number {
        //console.log("..index " + index + " NativeShaderDataType.Matrix4x4 " + NativeShaderDataType.Matrix4x4 + "stride " + stride);
        var length = 18;
        memoryBlock.int32Array[stride] = index;
        memoryBlock.int32Array[stride + 1] = NativeShaderDataType.Matrix4x4;
        var value: Matrix4x4 = this._data[index];
        memoryBlock.float32Array.set(value.elements, stride + 2);
        return length;
    }

    compressNumberArray(index: number, memoryBlock: UploadMemory, stride: number): number {
        //console.log("..index " + index + " NativeShaderDataType.Number32Array " + NativeShaderDataType.Number32Array + "stride " + stride);
        memoryBlock.int32Array[stride] = index
        memoryBlock.int32Array[stride + 1] = NativeShaderDataType.Number32Array;
        var value: Float32Array = this._data[index];
        memoryBlock.int32Array[stride + 2] = value.length;
        memoryBlock.float32Array.set(value, stride + 3);
        return value.length + 3;
    }

    compressTexture(index: number, memoryBlock: UploadMemory, stride: number): number {
        //console.log("..index " + index + " NativeShaderDataType.Texture " + NativeShaderDataType.Texture + "stride " + stride);
        var value: BaseTexture = this._data[index];
        memoryBlock.int32Array[stride] = index;
        memoryBlock.int32Array[stride + 1] = NativeShaderDataType.Texture;
        memoryBlock.int32Array[stride + 2] = (value._texture as any).id;
        return 3;
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
     * 清空宏定义。
     */
    clearDefine(): void {
        this._defineDatas.clear();
    }

    private configMotionProperty(key:number,length:number,callBack:Function){
        this.updateMap.set(key,callBack);
        this.updataSizeMap.set(key,length);
        if(!this.inUploadList) {
            this.inUploadList = true;
            UploadMemoryManager.getInstance()._dataNodeList.add(this);
        }
    }

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        this._data[index] = value;
        this.configMotionProperty(index, 3, this.compressNumber);
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        this._data[index] = value;
        this.configMotionProperty(index, 3, this.compressNumber);
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        this._data[index] = value;
        this.configMotionProperty(index, 3, this.compressNumber);
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
        this.configMotionProperty(index, 4 , this.compressVector2);
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
        this.configMotionProperty(index, 5, this.compressVector3);
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
        this.configMotionProperty(index, 6, this.compressVector4);
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
        this.configMotionProperty(index, 6, this.compressVector4);
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        this._data[index] = value.clone();
        this.configMotionProperty(index, 18, this.compressMatrix4x4);
    }


    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._data[index] = value;
        this.configMotionProperty(index, 3 + value.length, this.compressNumberArray);
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._data[index];
        this._data[index] = value ? value : Texture2D.erroTextur;
        this.configMotionProperty(index, 3, this.compressTexture);
        if (this._ownerResource && this._ownerResource.referenceCount > 0) {
            (lastValue) && (lastValue._removeReference());
            (value) && (value._addReference());
        }
    }

    /**
     * set shader data
     * @param index uniformID
     * @param value data
     */
    setValueData(index: number, value: any) {
        // if (!!value.clone)
        //     this._data[index] = value.clone();
        // else
        //     this._data[index] = value;
        //有点恶心
        if (typeof value == "boolean") {
            this.setBool(index, <boolean>value);
        } else if (typeof value == "number") {
            this.setNumber(index, <number>value); 
        } else if (value instanceof Vector2) {
            this.setVector2(index, <Vector2>value);
        } else if (value instanceof Vector3) {
            this.setVector3(index, <Vector3>value);
        } else if (value instanceof Vector4 || value instanceof Quaternion) {
            this.setVector(index, <Vector4>value);
        } else if (value instanceof Matrix4x4) {
            this.setMatrix4x4(index, <Matrix4x4>value);
        } else if (value.ArrayBuffer != null) {
            this.setBuffer(index, value);
        } else if (value._texture != null) {
            this.setTexture(index, value);
        }
    }

    cloneTo(destObject: NativeShaderData) {
        var dest: NativeShaderData = <NativeShaderData>destObject;
		for (var k in this._data) {//TODO:需要优化,杜绝is判断，慢
			var value: any = this._data[k];
			if (value != null) {
				if (typeof (value) == 'boolean') {
					destObject.setBool((k as any), value);
				} else if (typeof (value) == 'number') {
					destObject.setNumber(k as any, <number>value);
				} else if (value instanceof Vector2) {
                    destObject.setVector2(k as any, <Vector2>value);
				} else if (value instanceof Vector3) {
					destObject.setVector3(k as any, <Vector3>value);
				} else if (value instanceof Vector4) {
					destObject.setVector(k as any, <Vector4>value);
				} else if (value instanceof Matrix4x4) {
                    destObject.setMatrix4x4(k as any, <Matrix4x4>value);
				} else if (value instanceof BaseTexture) {
					destObject.setTexture(k as any, value);
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
        var dest: NativeShaderData = new NativeShaderData();
        this.cloneTo(dest);
        return dest;
    }

}