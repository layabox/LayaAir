import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";

/**
 * 每一个Uniform变量的具体信息
 */
type ItemType = {
    propertyId: number, //编码
    name: string, //名称
    type: string, //数据类型int, float, vec2 ...
    size: number, //字节长度
    align: number, //字节对齐
    offset: number, //字节偏移
    element: number, //每个数据有多少个成员，比如vec2有2个float成员
    count: number, //非数组count=1，否则count=数组长度
};

/**
 * UniformBlock信息
 */
export class WebGPUUniformBlockInfo {
    name: string; //Block名称
    size: number; //Block字节长度
    items: ItemType[]; //具体的uniform变量

    globalId: number;
    objectName: string = 'WebGPUUniformBlockInfo';

    constructor(name: string, size: number) {
        this.name = name;
        this.size = size;
        this.items = [];

        this.globalId = WebGPUGlobal.getId(this);
    }

    /**
     * 添加uniform字段
     * @param name 
     * @param type 
     * @param offset 
     * @param align 
     * @param size 
     * @param element 
     * @param count 
     */
    addUniform(name: string, type: string, offset: number, align: number, size: number, element: number, count: number) {
        this.items.push(
            {
                propertyId: Shader3D.propertyNameToID(name),
                name,
                type,
                size,
                align,
                offset,
                element,
                count
            });
    }

    /**
     * 是否具有指定的uniform
     * @param propertyId 
     */
    hasUniform(propertyId: number) {
        for (let i = this.items.length - 1; i > -1; i--)
            if (this.items[i].propertyId === propertyId)
                return true;
        return false;
    }

    /**
     * 输出调试信息
     */
    debugInfo() {
        for (let i = 0, len = this.items.length; i < len; i++) {
            const item = this.items[i];
            console.log('id: %d, name: %s, type: %s, size: %d, align: %d, offset: %d, elements: %d, count: %d',
                item.propertyId, item.name, item.type, item.size, item.align, item.offset, item.element, item.count);
        }
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}