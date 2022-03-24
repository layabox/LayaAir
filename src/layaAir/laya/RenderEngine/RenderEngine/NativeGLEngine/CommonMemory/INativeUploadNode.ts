import { MemoryDataType } from "./MemoryDataType";
import { UploadMemory } from "./UploadMemory";

/**
 * 接口规范Native更新数据的命令
 */
export interface INativeUploadNode{
    /**Node Type */
    _dataType:MemoryDataType;
    /**NativeID */
    nativeObjID:number;
    //组织一条数据更新命令
    compressAllObject():number;
    //组织头数据
    UploadDataTOShareMemory(memoryBlock:UploadMemory,stride:number):void;
}