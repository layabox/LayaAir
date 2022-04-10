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

export enum ShaderDataType {
    Number,
    Vector2,
    Vector3,
    Vector4,
    Matrix4x4,
    numberArray,
    Texture,
    ShaderDefine,
}

export class ShaderDataNative extends ShaderData implements INativeUploadNode {
    static ShaderDefineMapIndex:number = -1;
    static tempUploadData:Float32Array = new Float32Array(65536);//TODO扩展性和性能 并且可能会产生GC，后面需要重新考虑
    _dataType: MemoryDataType;
    nativeObjID: number;
    updateMap: Map<number, Function>;
    _uploadArray:Float32Array;
    /**
     * @internal	
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource)
        this._initData();
        //TODO native Create
        //this.nativeObjID = native.createShaderdata()
        this._dataType = MemoryDataType.ShaderData;
        this.updateMap = new Map();

    }
    /**
     * @override interface INativeUploadNode
     * @internal
     */
    compressAllObject(): number {
        ShaderDataNative.tempUploadData[0] = this.updateMap.size;
        let stride = 1;
        this.updateMap.forEach((value,key) => {
            stride+=value.call(key,ShaderDataNative.tempUploadData,stride);
        });
        this._uploadArray = ShaderDataNative.tempUploadData.slice(0,stride);
        return stride;
    }

    /**
     * @override interface INativeUploadNode
     * @internal
     * @param memoryBlock 
     * @param stride 
     */
    uploadDataTOShareMemory(memoryBlock: UploadMemory, stride: number): void {
        let array = memoryBlock.float32Array;
        let strideFloat = stride/4;
        //type
        array[strideFloat] = MemoryDataType.ShaderData;
        //instanceID
        array[strideFloat+1] = this.nativeObjID;
        //dataLength
        array[strideFloat+2] = this._uploadArray.length*4;
        //Data
        array.set(this._uploadArray,strideFloat+3);

        this.clearUpload();
    }

    uploadAllData(): void {
        //TODO
        //native.clone shaderData TODO
        
    }

    clearUpload() {
        this.updateMap.clear();
    }

    compressNumber(index:number,data:Float32Array,stride:number):number{
        var length = 3;
        data[stride] = index;
        data[stride+1] = ShaderDataType.Number;
        data[stride+2] = this._data[index];
        return length;
    }

    compressVector2(index:number,data:Float32Array,stride:number):number{
        var length = 4;
        data[stride] = index;
        data[stride+1] = ShaderDataType.Vector2;
        var value:Vector2= this._data[index];
        data[stride+2] = value.x;
        data[stride+3] = value.y;
        return length;
    }

    compressVector3(index:number,data:Float32Array,stride:number):number{
        var length = 5;
        data[stride] = index;
        data[stride+1] = ShaderDataType.Vector3;
        var value:Vector3= this._data[index];
        data[stride+2] = value.x;
        data[stride+3] = value.y;
        data[stride+4] = value.z;
        return length;
    }

    compressVector4(index:number,data:Float32Array,stride:number):number{
        var length = 6;
        data[stride] = index;
        data[stride+1] = ShaderDataType.Vector4;
        var value:Vector4= this._data[index];
        data[stride+2] = value.x;
        data[stride+3] = value.y;
        data[stride+4] = value.z;
        data[stride+5] = value.w;
        return length;
    }

    compressMatrix4x4(index:number,data:Float32Array,stride:number):number{
        var length = 18;
        data[stride] = index;
        data[stride+1] = ShaderDataType.Matrix4x4;
        var value:Matrix4x4= this._data[index];
        data.set(value.elements,stride+2);
        return length;
    }

    compressNumberArray(index:number,data:Float32Array,stride:number):number{
        data[stride] = index
        data[stride+1] = ShaderDataType.numberArray;
        var value:Float32Array= this._data[index];
        data[stride+2] = value.length;
        data.set(value,stride+3);
        return value.length+3;
    }
    
    compressTexture(index:number,data:Float32Array,stride:number):number{
        var value:BaseTexture = this._data[index];
        data[stride] = index;
        data[stride+1] = ShaderDataType.Texture;
        data[stride+2] = value._texture.resource.id;//TODO
        return 3;
    }

    compressShaderDefine(index:number,data:Float32Array,stride:number):number{
        var length = 3;
        data[stride] = index;
        data[stride+1] = ShaderDataType.ShaderDefine;
        let defineLength = data[stride+2] = this._defineDatas._length;
        for(let i:number;i<defineLength;i++,length++){
            data[stride+length] = this._defineDatas._mask[i];
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

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        this._data[index] = value;
        this.updateMap.set(index, this.compressNumber);
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        this._data[index] = value;
        this.updateMap.set(index, this.compressNumber);
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        this._data[index] = value;
        this.updateMap.set(index, this.compressNumber);
    }

    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        this._data[index] = value.clone();
        this.updateMap.set(index, this.compressVector2);
    }

    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        this._data[index] = value.clone();
        this.updateMap.set(index, this.compressVector3);
    }

    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void {
        this._data[index] = value.clone();
        this.updateMap.set(index, this.compressVector4);
    }

    /**
     * 设置四元数。
     * @param	index shader索引。
     * @param	value 四元数。
     */
    setQuaternion(index: number, value: Quaternion): void {
        this._data[index] = value.clone();
        this.updateMap.set(index, this.compressVector4);
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        this._data[index] = value.clone();
        this.updateMap.set(index, this.compressMatrix4x4);
    }


    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._data[index] = value;
        this.updateMap.set(index, this.compressNumberArray);
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._data[index];
        this._data[index] = value ? value : Texture2D.erroTextur;
        this.updateMap.set(index, this.compressTexture);
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
            this.setNumber(index,<number>value);
        }else if(value instanceof Vector2){
            this.setVector2(index,<Vector2>value);
        }else if(value instanceof Vector3){
            this.setVector3(index,<Vector3>value);
        }else if(value instanceof Vector4||value instanceof Quaternion){
            this.setVector(index,<Vector4>value);
        }else if(value instanceof Matrix4x4){
            this.setMatrix4x4(index,<Matrix4x4>value);
        }else if(value.ArrayBuffer!=null){
            this.setBuffer(index,value);
        }else if(value._texture!=null){
            this.setTexture(index,value);
        }
    }

    cloneTo(destObject: ShaderDataNative) {
        super.cloneTo(destObject);
        destObject.uploadAllData();
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: ShaderDataNative = new ShaderDataNative();
        this.cloneTo(dest);
        return dest;
    }

}