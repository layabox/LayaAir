import { Matrix3x3 } from "../../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../ShaderData";
import { IUniformBufferUser } from "./IUniformBufferUser";
import { UniformBufferAlone } from "./UniformBufferAlone";
import { UniformBufferBlock } from "./UniformBufferBlock";
import { TypedArray, TypedArrayConstructor, UniformBufferManager } from "./UniformBufferManager";

type ItemType = {
    name: string, //名称
    view: TypedArray, //ArrayBufferView
    type: string, //int, float, vec2 ...
    align: number, //字节对齐
    size: number, //字节长度
    elements: number, //每个数据有多少个成员，比如vec2有2个float成员
    count: number, //非数组count=1，否则count=数组长度
};

/**
 * UniformBuffer使用者
 */
export class UniformBufferUser implements IUniformBufferUser {
    name: string;
    strId: string;
    size: number;
    items: Map<number, ItemType>;
    itemNum: number;
    destroyed: boolean = false; //该对象是否已经销毁

    needUpload: boolean;
    bufferBlock: UniformBufferBlock;
    bufferAlone: UniformBufferAlone;
    manager: UniformBufferManager;
    data: ShaderData;
    offset: number;

    constructor(name: string, size: number, manager: UniformBufferManager, data: ShaderData) {
        this.name = name;
        this.strId = '';
        this.items = new Map();
        this.itemNum = 0;
        this.data = data;
        this.size = size;
        this.manager = manager;
        this.needUpload = false;

        if (manager.useBigBuffer) {
            this.bufferBlock = manager.getBlock(size, this);
            this.offset = this.bufferBlock.offset;
        } else this.bufferAlone = new UniformBufferAlone(size, manager);
    }

    /**
     * 通知GPUBuffer改变
     */
    notifyGPUBufferChange() {
        const offset = this.bufferBlock.offset - this.offset;
        this.offset = this.bufferBlock.offset;
        this.items.forEach(item => {
            const tac = UniformBufferUser._typeArray(item.type);
            item.view = new tac(this.bufferBlock.cluster.data, item.view.byteOffset + offset, item.size / tac.BYTES_PER_ELEMENT);
        });
        this.clearGPUBufferBind();
        this.needUpload = true;
    }

    /**
     * 清除GPUBuffer绑定
     */
    clearGPUBufferBind() { }

    /**
     * 添加uniform字段
     * @param id 
     * @param name 
     * @param type 
     * @param offset 
     * @param align 
     * @param size 
     * @param elements 
     * @param count 
     */
    addUniform(id: number, name: string, type: string, offset: number, align: number, size: number, elements: number, count: number) {
        if (this.items.has(id)) return; //该Uniform已经存在
        this.items.set(id, this._getUniformItem(name, UniformBufferUser._typeArray(type), type, offset, align, size, elements, count));
        if (this.strId.length > 0)
            this.strId += '|';
        this.strId += id;
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
            if (item.count == 1) {
                switch (item.type) {
                    case 'int':
                    case 'float':
                        item.view[0] = data;
                        break;
                    case 'vec2':
                        item.view[0] = data.x;
                        item.view[1] = data.y;
                        break;
                    case 'vec3':
                        item.view[0] = data.x;
                        item.view[1] = data.y;
                        item.view[2] = data.z;
                        break;
                    case 'vec4':
                        item.view[0] = data.x;
                        item.view[1] = data.y;
                        item.view[2] = data.z;
                        item.view[3] = data.w;
                        break;
                    case 'mat3':
                        for (let i = 0; i < 3; i++) {
                            item.view[i * 4 + 0] = data.elements[i * 3 + 0];
                            item.view[i * 4 + 1] = data.elements[i * 3 + 1];
                            item.view[i * 4 + 2] = data.elements[i * 3 + 2];
                        }
                        break;
                    case 'mat4':
                        item.view.set(data.elements);
                        break;
                    default:
                        break;
                }
            } else {
                const arraySize = item.count * item.elements;
                const alignElements = item.size / item.count / item.view.BYTES_PER_ELEMENT;
                for (let i = 0, j = 0; i < arraySize; i += item.elements, j += alignElements)
                    item.view.set(data.subarray(i, i + item.elements), j);
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
        this.setUniformData(id, data);
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
     * 根据strId判断是否命中
     * @param strId 
     */
    isMe(strId: string) {
        return this.strId === strId;
    }

    /**
     * 上传数据
     */
    upload() {
        if (this.needUpload) {
            if (this.manager.useBigBuffer)
                this.bufferBlock.needUpload();
            else this.bufferAlone.upload();
            this.needUpload = false;
        }
    }

    /**
     * 清除所有uniform
     */
    clear() {
        if (this.manager.useBigBuffer)
            new Uint8Array(this.bufferBlock.cluster.data).fill(0, this.bufferBlock.offset, this.bufferBlock.offset + this.bufferBlock.size);
        else new Uint8Array(this.bufferAlone.data).fill(0);
        this.strId = '';
        this.items.clear();
        this.itemNum = 0;
        this.needUpload = false;
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this.destroyed) {
            if (this.manager.useBigBuffer)
                this.manager.freeBlock(this.bufferBlock);
            else this.bufferAlone.destroy();
            this.destroyed = true;
            return true;
        }
        console.warn('UniformBufferUser: object alreay destroyed!');
        return false;
    }

    /**
     * 获取一个unifromItem
     * @param name 
     * @param tac 
     * @param type 
     * @param offset 
     * @param align 
     * @param size 
     * @param elements 
     * @param count 
     */
    protected _getUniformItem(name: string, tac: TypedArrayConstructor, type: string, offset: number, align: number, size: number, elements: number, count: number) {
        let view: TypedArray;
        if (this.manager.useBigBuffer)
            view = new tac(this.bufferBlock.cluster.data, this.bufferBlock.offset + offset, size / tac.BYTES_PER_ELEMENT);
        else view = new tac(this.bufferAlone.data, offset, size / tac.BYTES_PER_ELEMENT);
        return { name, view, type, align, size, elements, count };
    }

    /**
     * 根据type获取TypeArray类型
     * @param type 
     */
    protected static _typeArray(type: string) {
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
}