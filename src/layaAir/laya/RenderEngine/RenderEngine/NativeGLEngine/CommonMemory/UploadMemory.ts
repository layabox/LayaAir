import { INativeUploadNode } from "./INativeUploadNode";
import { MemoryDataType } from "./MemoryDataType";
import { NativeMemory } from "./NativeMemory";

export class UploadMemory extends NativeMemory{
    
    /**
     * @internal
     * 数据填充的位置
     */
    _currentStride:number = 0;

    /**
     * @internal
     * index of manager list
     */
    _index:number;

    constructor(size:number,indexOfManager:number){
        super(size);
        this._index = indexOfManager;
    }

    addBlockCell(node: INativeUploadNode, dataSize: number){
        node.UploadDataTOShareMemory(this,this._currentStride);
        this._currentStride+=dataSize;
    }

    /**
     * check ability of size data
     * @param size 
     * @returns 
     */
    check(size:number){
        return this._currentStride+size<this._byteLength;
    }

    /**
     * 清空更新数据
     */
    clear(): void {
      this._currentStride = 0;
    }


}