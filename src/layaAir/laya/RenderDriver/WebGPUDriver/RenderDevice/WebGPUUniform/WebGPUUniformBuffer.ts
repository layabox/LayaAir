import { WebGPUBufferBlock, WebGPUBufferManager } from "./WebGPUBufferManager";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { Matrix3x3 } from "../../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";

type TypedArray =
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

type TypedArrayConstructor =
    | Int8ArrayConstructor
    | Uint8ArrayConstructor
    | Int16ArrayConstructor
    | Uint16ArrayConstructor
    | Int32ArrayConstructor
    | Uint32ArrayConstructor
    | Float32ArrayConstructor
    | Float64ArrayConstructor;

/**
 * 向上圆整到align的整数倍
 * @param n 
 * @param align 
 */
const roundUp = (n: number, align: number) => (((n + align - 1) / align) | 0) * align;

export type UniformItemType = {
    view: TypedArray, //ArrayBufferView
    type: string, //int, float, vec2 ...
    align: number, //字节对齐
    size: number, //字节长度
    elements: number, //每个数据有多少个成员，比如vec2有2个float成员
    count: number, //非数组count=1，否则count=数组长度
};

export class UniformBuffer {
    name: string;
    strID: string;
    arrayBuffer: ArrayBuffer;
    bytes: Uint8Array;
    items: Map<number, UniformItemType>;
    itemNum: number;
    needUpload: boolean;

    set: number;
    binding: number;
    offset: number;
    block: WebGPUBufferBlock;

    private _gpu_Buffer: GPUBuffer;
    private _gpu_BindGroupEntry: GPUBindGroupEntry;

    constructor(name: string, set: number, binding: number, size: number, gpuBuffer: WebGPUBufferManager) {
        this.arrayBuffer = new ArrayBuffer(size);
        this.bytes = new Uint8Array(this.arrayBuffer);
        this.name = name;
        this.strID = '';
        this.items = new Map();
        this.itemNum = 0;
        this.needUpload = false;

        this.set = set;
        this.binding = binding;
        this.block = gpuBuffer.getBlock(name, size);

        //@ts-ignore
        this._gpu_Buffer = gpuBuffer.getBuffer(name);
        this._gpu_BindGroupEntry = {
            binding,
            resource: { //@ts-ignore
                buffer: this._gpu_Buffer,
                offset: this.offset,
                size,
            },
        };
    }

    /**
     * 添加uniform字段
     * @param id 
     * @param type 
     * @param offset 
     * @param align 
     * @param size 
     * @param elements 
     * @param count 
     */
    addUniform(id: number, type: string, offset: number, align: number, size: number, elements: number, count: number) {
        if (this.items.has(id)) return; //该Uniform已经存在
        this.items.set(id, this._getUniformItem(UniformBuffer._typeArray(type), type, offset, align, size, elements, count));
        if (this.strID.length > 0)
            this.strID += '|';
        this.strID += name;
        this.itemNum++;
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setUniformData(id: number, data: any) {
        const item = this.items.get(id);
        if (item) {
            this.needUpload = true;
            switch (item.type) {
                case 'int':
                case 'float':
                    if (item.count == 1)
                        item.view[0] = data;
                    else {
                        for (let i = 0, len = Math.min(item.count, data.length); i < len; i++)
                            item.view[i] = data[i];
                    }
                    break;
                case 'vec2':
                    if (item.count == 1) {
                        item.view[0] = data.x;
                        item.view[1] = data.y;
                    }
                    else {
                        for (let i = 0, len = Math.min(item.count, data.length); i < len; i++) {
                            item.view[i * 2 + 0] = data[i].x;
                            item.view[i * 2 + 1] = data[i].y;
                        }
                    }
                    break;
                case 'vec3':
                    if (item.count == 1) {
                        item.view[0] = data.x;
                        item.view[1] = data.y;
                        item.view[2] = data.z;
                    }
                    else {
                        for (let i = 0, len = Math.min(item.count, data.length); i < len; i++) {
                            item.view[i * 4 + 0] = data[i].x;
                            item.view[i * 4 + 1] = data[i].y;
                            item.view[i * 4 + 2] = data[i].z;
                        }
                    }
                    break;
                case 'vec4':
                    if (item.count == 1) {
                        item.view[0] = data.x;
                        item.view[1] = data.y;
                        item.view[2] = data.z;
                        item.view[3] = data.w;
                    }
                    else {
                        for (let i = 0, len = Math.min(item.count, data.length); i < len; i++) {
                            item.view[i * 4 + 0] = data[i].x;
                            item.view[i * 4 + 1] = data[i].y;
                            item.view[i * 4 + 2] = data[i].z;
                            item.view[i * 4 + 3] = data[i].w;
                        }
                    }
                    break;
                case 'mat3':
                    if (item.count == 1) {
                        for (let i = 0; i < 3; i++) {
                            item.view[i * 4 + 0] = data.elements[i * 3 + 0];
                            item.view[i * 4 + 1] = data.elements[i * 3 + 1];
                            item.view[i * 4 + 2] = data.elements[i * 3 + 2];
                        }
                    }
                    else {
                        for (let j = 0, len = Math.min(item.count, data.length); j < len; j++) {
                            for (let i = 0; i < 3; i++) {
                                item.view[j * 16 + i * 4 + 0] = data[j].elements[i * 3 + 0];
                                item.view[j * 16 + i * 4 + 1] = data[j].elements[i * 3 + 1];
                                item.view[j * 16 + i * 4 + 2] = data[j].elements[i * 3 + 2];
                            }
                        }
                    }
                    break;
                case 'mat4':
                    if (item.count == 1)
                        item.view.set(data.elements);
                    else {
                        for (let i = 0, len = Math.min(item.count, data.length); i < len; i++)
                            item.view.set(data[i].elements, i * 16);
                    }
                    break;
                case 'buffer':
                    item.view.set(data);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setBool(id: number, data: boolean) {
        const item = this.items.get(id);
        if (item) {
            item.view[0] = data ? 1 : 0;
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setBoolArray(id: number, data: boolean[]) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0, len = Math.min(item.count, data.length); i < len; i++)
                item.view[i] = data[i] ? 1 : 0;
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setInt(id: number, data: number) {
        const item = this.items.get(id);
        if (item) {
            item.view[0] = data;
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setIntArray(id: number, data: number[]) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0, len = Math.min(item.count, data.length); i < len; i++)
                item.view[i] = data[i];
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setFloat(id: number, data: number) {
        const item = this.items.get(id);
        if (item) {
            item.view[0] = data;
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setFloatArray(id: number, data: number[]) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0, len = Math.min(item.count, data.length); i < len; i++)
                item.view[i] = data[i];
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setVector2(id: number, data: Vector2) {
        const item = this.items.get(id);
        if (item) {
            item.view[0] = data.x;
            item.view[1] = data.y;
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setVector2Array(id: number, data: Vector2[]) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0, len = Math.min(item.count, data.length); i < len; i++) {
                item.view[i * 2 + 0] = data[i].x;
                item.view[i * 2 + 1] = data[i].y;
            }
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setVector3(id: number, data: Vector3) {
        const item = this.items.get(id);
        if (item) {
            item.view[0] = data.x;
            item.view[1] = data.y;
            item.view[2] = data.z;
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setVector3Array(id: number, data: Vector3[]) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0, len = Math.min(item.count, data.length); i < len; i++) {
                item.view[i * 4 + 0] = data[i].x;
                item.view[i * 4 + 1] = data[i].y;
                item.view[i * 4 + 2] = data[i].z;
            }
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setVector4(id: number, data: Vector4) {
        const item = this.items.get(id);
        if (item) {
            item.view[0] = data.x;
            item.view[1] = data.y;
            item.view[2] = data.z;
            item.view[3] = data.w;
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setVector4Array(id: number, data: Vector4[]) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0, len = Math.min(item.count, data.length); i < len; i++) {
                item.view[i * 4 + 0] = data[i].x;
                item.view[i * 4 + 1] = data[i].y;
                item.view[i * 4 + 2] = data[i].z;
                item.view[i * 4 + 3] = data[i].w;
            }
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setMatrix3x3(id: number, data: Matrix3x3) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0; i < 3; i++) {
                item.view[i * 4 + 0] = data.elements[i * 3 + 0];
                item.view[i * 4 + 1] = data.elements[i * 3 + 1];
                item.view[i * 4 + 2] = data.elements[i * 3 + 2];
            }
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setMatrix3x3Array(id: number, data: Matrix3x3[]) {
        const item = this.items.get(id);
        if (item) {
            for (let j = 0, len = Math.min(item.count, data.length); j < len; j++) {
                for (let i = 0; i < 3; i++) {
                    item.view[j * 16 + i * 4 + 0] = data[j].elements[i * 3 + 0];
                    item.view[j * 16 + i * 4 + 1] = data[j].elements[i * 3 + 1];
                    item.view[j * 16 + i * 4 + 2] = data[j].elements[i * 3 + 2];
                }
            }
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setMatrix4x4(id: number, data: Matrix4x4) {
        const item = this.items.get(id);
        if (item) {
            item.view.set(data.elements);
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setMatrix4x4Array(id: number, data: Matrix4x4[]) {
        const item = this.items.get(id);
        if (item) {
            for (let i = 0, len = Math.min(item.count, data.length); i < len; i++)
                item.view.set(data[i].elements, i * 16);
            this.needUpload = true;
        }
    }

    /**
     * 设置uniform数据
     * @param id 
     * @param data 
     */
    setBuffer(id: number, data: Float32Array) {
        const item = this.items.get(id);
        if (item) {
            item.view.set(data);
            this.needUpload = true;
        }
    }

    /**
     * 获取uniformItem
     * @param id 
     */
    getUniform(id: number) {
        return this.items.get(id);
    }

    /**
     * 是否存在指定的uniform
     * @param id  
     */
    hasUniform(id: number) {
        return this.items.has(id);
    }

    /**
     * 根据strID判断是否命中
     * @param strID 
     */
    isMe(strID: string) {
        return this.strID == strID;
    }

    /**
     * 上传数据
     */
    upload(device: GPUDevice) {
        if (this.needUpload) {
            device.queue.writeBuffer(this._gpu_Buffer, this.offset, this.arrayBuffer);
            this.needUpload = false;
        }
    }

    /**
     * 清除所有uniform
     */
    clear() {
        new Uint8Array(this.arrayBuffer).fill(0);
        this.strID = '';
        this.items.clear();
        this.itemNum = 0;
        this.needUpload = false;
    }

    /**
     * 获取数据
     */
    getArrayBuffer() {
        return this.arrayBuffer;
    }

    /**
     * 获取GPUBuffer
     */
    getGPUBuffer() {
        return this._gpu_Buffer;
    }

    /**
     * 获取WebGPU绑定资源入口
     */
    getGPUBindEntry() {
        return this._gpu_BindGroupEntry;
    }

    /**
     * 获取一个unifromItem
     * @param tac 
     * @param type 
     * @param offset 
     * @param align 
     * @param size 
     * @param elements 
     * @param count 
     */
    private _getUniformItem(tac: TypedArrayConstructor, type: string, offset: number, align: number, size: number, elements: number, count: number) {
        const view = new tac(this.arrayBuffer, offset, this._typeElements(type) * count);
        return { view, type, align, size, elements, count };
    }

    /**
     * 根据数据类型判断elements数量
     * @param type 
     */
    private _typeElements(type: string) {
        switch (type) {
            case 'int':
            case 'float':
                return 1;
            case 'vec2':
                return 2;
            case 'vec3':
                return 3;
            case 'vec4':
                return 4;
            case 'mat3': //因为有内存对齐要求，mat3所需要的float数量是4*3=12而不是3*3=9
                return 12;
            case 'mat4':
                return 16;
            default:
                return 1;
        }
    }

    /**
     * 根据type获取TypeArray类型
     * @param type 
     */
    private static _typeArray(type: string) {
        switch (type) {
            case 'int':
                return Int32Array;
            case 'float':
            case 'vec2':
            case 'vec3':
            case 'vec4':
            case 'mat3':
            case 'mat4':
                return Float32Array;
            default:
                return Float32Array;
        }
    }

    /**
     * 输出调试信息
     */
    debugInfo() {
        if (this.itemNum > 0) {
            const typeName = (type: TypedArray) => {
                if (type instanceof Int32Array)
                    return 'Init32Array';
                if (type instanceof Float32Array)
                    return 'Float32Array';
                return 'Unknown';
            }
            console.log("arrayBuffer");
            console.log("byteLength =", this.arrayBuffer.byteLength);
            console.log("strID =", this.strID);
            this.items.forEach((item, key) => {
                console.log("key: %d, type: %s, view: %s, offset: %d, size: %d, padding: %d, elements: %d, count: %d",
                    key, item.type, typeName(item.view), item.view.byteOffset, item.view.byteLength,
                    roundUp(item.view.byteLength / item.count, item.align) - item.view.BYTES_PER_ELEMENT * item.elements,
                    item.elements, item.count);
            });
        }
    }
}