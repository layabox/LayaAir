import { INativeUploadNode } from "./INativeUploadNode";
import { NativeMemory } from "./NativeMemory";

export class UploadMemory extends NativeMemory{
    
    /**
     * @internal
     * 数据填充的位置
     */
    _currentOffsetInByte:number = 0;

    constructor(size:number){
        super(size,false);
    }

    addBlockCell(node: INativeUploadNode, dataSizeInByte: number){
        if (node.uploadDataTOShareMemory(this, this._currentOffsetInByte)) {
            this._currentOffsetInByte += dataSizeInByte;
        }
    }

    /**
     * check ability of size data
     * @param size 
     * @returns 
     */
    check(size:number){
        return this._currentOffsetInByte + size < this._byteLength;
    }

    /**
     * 清空更新数据
     */
    clear(): void {
      this._currentOffsetInByte = 0;
    }


}