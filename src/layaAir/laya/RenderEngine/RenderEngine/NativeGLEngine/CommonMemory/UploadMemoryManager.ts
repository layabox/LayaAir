import { SingletonList } from "../../../../d3/component/SingletonList";
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
     * defined 10M
     */
    static UploadMemorySize: number = 1024 * 1024 * 10 * 4;
    //DescribeData type + instanceID + dataLength
    static TopLength: number = 3 * 4;
    /*@internal SingleOBJ*/
    private static _instance: UploadMemoryManager = null;
    /**@internal 需要上传数据的Node列表*/
    _dataNodeList: SingletonList<INativeUploadNode> = new SingletonList();
    /**@internal */
    _currentBlock: UploadMemory;
    /**@internal */
    _commandNums: number;

    /**@native C++ */
    _conchUploadMemoryManager:any;

    constructor() {
        UploadMemoryManager._instance = this;
        this._currentBlock = new UploadMemory(UploadMemoryManager.UploadMemorySize);
        this._conchUploadMemoryManager = new (window as any).conchUploadMemoryManager();
    }
    static getInstance(): UploadMemoryManager {
        if (!UploadMemoryManager._instance) {
            UploadMemoryManager._instance = new UploadMemoryManager();
        }
        return UploadMemoryManager._instance;
    }
    private _addNodeCommand(node: INativeUploadNode, size: number) {
        this._currentBlock.addBlockCell(node, size);
        this._commandNums++;
    }

    static syncRenderMemory()
    {
        UploadMemoryManager.getInstance()._serialiseData();
    }

    /**
     * @internal
     */
    private _serialiseData() {
        const elements = this._dataNodeList.elements;
        for (let i = 0; i < this._dataNodeList.length; i++) {
            let node = elements[i];
            let dataSize = node.getUploadMemoryLength();//get upload Memory Length
            if (dataSize > UploadMemoryManager.UploadMemorySize)
                throw "dataSize is too large, greater than UploadMemorySize,";
            if (this._currentBlock.check(dataSize)) {
                //Deserialization all cmd to native data
                this.uploadData();
                this._addNodeCommand(node, dataSize);
            } else {
                this._addNodeCommand(node, dataSize);
            }
        }
    }

    /**强制更新数据 */
    uploadData() {
        //Native upload data
        this._conchUploadMemoryManager.uploadData( this._currentBlock._buffer,this._commandNums);
        //clear uploadMemory
        this._commandNums = 0;
        this._currentBlock.clear();
    }


    /**
     * clear UpdateLoad list
     */
    clear() {
        this._dataNodeList.length = 0;
    }
}