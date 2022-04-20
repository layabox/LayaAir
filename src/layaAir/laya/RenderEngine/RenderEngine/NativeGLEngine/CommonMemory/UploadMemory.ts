import { INativeUploadNode } from "./INativeUploadNode";
import { NativeMemory } from "./NativeMemory";

export class UploadMemory extends NativeMemory{
    
    /**
     * @internal
     * 数据填充的位置
     */
    _currentStride:number = 0;

    constructor(size:number){
        super(size);
    }

    addBlockCell(node: INativeUploadNode, dataSize: number){
        node.uploadDataTOShareMemory(this,this._currentStride);
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