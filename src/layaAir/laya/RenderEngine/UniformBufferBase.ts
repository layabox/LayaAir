import { UniformBufferObject } from "./UniformBufferObject";

/**
 * 管理
 */
export class UniformBufferBase {
    /**@internal */
    _singgle: boolean;
    /**@internal */
    _mapArray: UniformBufferObject[];
    /**@internal bind pointer*/
    _glPointerID: number;
    /**@internal ubo name*/
    _blockName: string;
    /**@internal */
    _curUniformBuffer:UniformBufferObject;
    /**
     * 实例化一个UBOBase
     * @internal
     * @param name 
     * @param pointer 
     * @param single 
     */
    constructor(name: string, pointer: number, single: boolean) {
        this._mapArray = [];
        this._blockName = name;
        this._singgle = single;
        this._glPointerID = pointer;
    }

    /**
     * 增加Buffer
     * @internal
     * @param buffer 
     */
    add(buffer: UniformBufferObject) {
        let index = this._mapArray.indexOf(buffer);
        if (index == -1)
            this._mapArray.push(buffer);
    }

    /**
     * 移除Buffer
     * @internal
     * @param buffer 
     */
    splitBuffer(buffer: UniformBufferObject) {
        let index = this._mapArray.indexOf(buffer);
        if (index != -1)
            this._mapArray.splice(index, 1);
    }
}