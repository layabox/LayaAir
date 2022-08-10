import { SingletonList } from "../../../../utils/SingletonList";
import { INativeUploadNode } from "./INativeUploadNode";
import { UploadMemory } from "./UploadMemory";

/**
 * 用来组织所有的数据更新
 * 基本思路如下：每个需要更新native数据的类都继承接口INativeUploadNode，当需要上传数据时，会添加到UploadMemoryMenager.dataNodeList队列中，统一更新数据到共享Buffer中
 * 会有一个共享Buffer NativeMemory来记录总共用了几个UploadMemory，每个Upload中有几个UploadMemoryCell，在native中统一的将数据变化全部同步到Native的渲染底层
 */
export class UploadMemoryManager {
    /**
     * each upload block memory size
     * defined 1MB
     */
    static UploadMemorySize: number = 10 * 1024 * 1024;
    /*@internal SingleOBJ*/
    private static _instance: UploadMemoryManager = null;
    /**@internal 需要上传数据的Node列表*/
    _dataNodeList: SingletonList<INativeUploadNode> = new SingletonList();
    /**@internal */
    _currentBlock: UploadMemory;
    /**@internal */
    _commandNums: number = 0;

    /**@native C++ */
    _conchUploadMemoryManager:any;

    constructor() {
        this._currentBlock = new UploadMemory(UploadMemoryManager.UploadMemorySize);
        this._conchUploadMemoryManager = new (window as any).conchUploadMemoryManager();
    }
    static getInstance(): UploadMemoryManager {
        if (!UploadMemoryManager._instance) {
            UploadMemoryManager._instance = new UploadMemoryManager();
        }
        return UploadMemoryManager._instance;
    }
    private _addNodeCommand(node: INativeUploadNode, sizeInByte: number) {
        this._currentBlock.addBlockCell(node, sizeInByte);
        this._commandNums++;
    }

    static syncRenderMemory()
    {
        UploadMemoryManager.getInstance()._serialiseData();
        UploadMemoryManager.getInstance().clear();
    }

    /**
     * @internal
     */
    private _serialiseData() {
        const elements = this._dataNodeList.elements;
        for (let i = 0; i < this._dataNodeList.length; i++) {
            let node = elements[i];
            let dataSizeInByte = node.getUploadMemoryLength();//get upload Memory Length
            if (dataSizeInByte > UploadMemoryManager.UploadMemorySize)
                throw "dataSize is too large, greater than UploadMemorySize,";
            if (this._currentBlock.check(dataSizeInByte)) { 
                 //Deserialization all cmd to native data
                this.uploadData();
                this._addNodeCommand(node, dataSizeInByte);
            } else { 
              
                this._addNodeCommand(node, dataSizeInByte);
            }
        }
        this.uploadData();
    }

    /**强制更新数据 */
    uploadData() {
        if (this._commandNums > 0)
        {
            //Native upload data
            this._conchUploadMemoryManager.uploadData(this._currentBlock._buffer, this._commandNums);
            //clear uploadMemory
            this._commandNums = 0;
            this._currentBlock.clear();
        }
    }


    /**
     * clear UpdateLoad list
     */
    clear() {
        this._dataNodeList.length = 0;
    }
}