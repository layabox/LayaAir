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

export enum ShaderDataType {
    Int32,
    Number32,
    Vector2,
    Vector3,
    Vector4,
    Matrix4x4,
    Int32Array,
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
    uploadByteSize: number;
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
        let length = 1 + UploadMemoryManager.TopLength;
        this.updataSizeMap.forEach((value) => {
            length += value;
        });
        this.uploadByteSize = length * 4;
        return this.uploadByteSize;
    }

    /**
     * @override interface INativeUploadNode
     * @internal
     * @param memoryBlock 
     * @param stride 
     */
    uploadDataTOShareMemory(memoryBlock: UploadMemory, stride: number): void {
        let array = memoryBlock.float32Array;
        let strideFloat = stride / 4;
        //type
        array[strideFloat++] = MemoryDataType.ShaderData;
        //instanceID
        array[strideFloat++] = this.nativeObjID;
        //dataLength
        array[strideFloat++] = this.uploadByteSize;
        //Shaderdata property change nums
        array[strideFloat++] = this.updateMap.size;
        //array.set(this._uploadArray,strideFloat+3);
        this.updateMap.forEach((value, key) => {
            strideFloat += value.call(key, array, strideFloat);
        });
        this.clearUpload();
        this.inUploadList = false;
    }

    clearUpload() {
        this.updateMap.clear();
    }

    compressNumber(index: number, data: Float32Array, stride: number): number {
        var length = 3;
        data[stride] = index;
        data[stride + 1] = ShaderDataType.Number32;
        data[stride + 2] = this._data[index];
        return length;
    }

    compressVector2(index: number, data: Float32Array, stride: number): number {
        var length = 4;
        data[stride] = index;
        data[stride + 1] = ShaderDataType.Vector2;
        var value: Vector2 = this._data[index];
        data[stride + 2] = value.x;
        data[stride + 3] = value.y;
        return length;
    }

    compressVector3(index: number, data: Float32Array, stride: number): number {
        var length = 5;
        data[stride] = index;
        data[stride + 1] = ShaderDataType.Vector3;
        var value: Vector3 = this._data[index];
        data[stride + 2] = value.x;
        data[stride + 3] = value.y;
        data[stride + 4] = value.z;
        return length;
    }

    compressVector4(index: number, data: Float32Array, stride: number): number {
        var length = 6;
        data[stride] = index;
        data[stride + 1] = ShaderDataType.Vector4;
        var value: Vector4 = this._data[index];
        data[stride + 2] = value.x;
        data[stride + 3] = value.y;
        data[stride + 4] = value.z;
        data[stride + 5] = value.w;
        return length;
    }

    compressMatrix4x4(index: number, data: Float32Array, stride: number): number {
        var length = 18;
        data[stride] = index;
        data[stride + 1] = ShaderDataType.Matrix4x4;
        var value: Matrix4x4 = this._data[index];
        data.set(value.elements, stride + 2);
        return length;
    }

    compressNumberArray(index: number, data: Float32Array, stride: number): number {
        data[stride] = index
        data[stride + 1] = ShaderDataType.Number32Array;
        var value: Float32Array = this._data[index];
        data[stride + 2] = value.length;
        data.set(value, stride + 3);
        return value.length + 3;
    }

    compressTexture(index: number, data: Float32Array, stride: number): number {
        var value: BaseTexture = this._data[index];
        data[stride] = index;
        data[stride + 1] = ShaderDataType.Texture;
        data[stride + 2] = value._texture.resource.id;//TODO
        return 3;
    }

    compressShaderDefine(index: number, data: Float32Array, stride: number): number {
        var length = 3;
        data[stride] = index;
        data[stride + 1] = ShaderDataType.ShaderDefine;
        let defineLength = data[stride + 2] = this._defineDatas._length;
        for (let i: number; i < defineLength; i++, length++) {
            data[stride + length] = this._defineDatas._mask[i];
        }
        return length;
    }

    /**
     * 增加Shader宏定义。
     * @param value 宏定义。
     */
    addDefine(define: ShaderDefine): void {
        this._defineDatas.add(define);
        //this.updateMap.set(ShaderDataNative.ShaderDefineMapIndex, this.compressShaderDefine);
    }

    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define: ShaderDefine): void {
        this._defineDatas.remove(define);
        //this.updateMap.set(ShaderDataNative.ShaderDefineMapIndex, this.compressShaderDefine);
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
        if(!this.inUploadList){
            this.inUploadList = true;
            UploadMemoryManager.BaseInstance._dataNodeList.add(this);
        }
    }

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        this._data[index] = value;
        this.configMotionProperty(index,1,this.compressNumber);
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        this._data[index] = value;
        this.configMotionProperty(index,1,this.compressNumber);
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        this._data[index] = value;
        this.configMotionProperty(index,1,this.compressNumber);
    }

    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        this._data[index] = value.clone();
        this.configMotionProperty(index,2,this.compressVector2);
    }

    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        this._data[index] = value.clone();
        this.configMotionProperty(index,3,this.compressVector2);
    }

    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void {
        this._data[index] = value.clone();
        this.configMotionProperty(index,4,this.compressVector4);
    }

    /**
     * 设置四元数。
     * @param	index shader索引。
     * @param	value 四元数。
     */
    setQuaternion(index: number, value: Quaternion): void {
        this._data[index] = value.clone();
        this.configMotionProperty(index,4,this.compressVector4);
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        this._data[index] = value.clone();
        this.configMotionProperty(index,16,this.compressMatrix4x4);
    }


    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._data[index] = value;
        this.configMotionProperty(index,value.length,this.compressNumberArray);
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._data[index];
        this._data[index] = value ? value : Texture2D.erroTextur;
        this.configMotionProperty(index,1,this.compressTexture);
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
        if (typeof value == "number" || typeof value == "boolean") {
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
        super.cloneTo(destObject);
        destObject.uploadAllData();
    }
    uploadAllData() {
        //clone shaderData
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