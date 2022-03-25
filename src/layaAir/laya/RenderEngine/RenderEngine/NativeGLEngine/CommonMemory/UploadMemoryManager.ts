import { SingletonList } from "../../../../d3/component/SingletonList";
import { INativeUploadNode } from "./INativeUploadNode";
import { MemoryDataType } from "./MemoryDataType";
import { NataiveMemory } from "./NativeMemory";
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
    static UploadMemorySize: number = 1024 * 1024 * 10;
    static BaseInstance: UploadMemoryManager;
    /**需要上传数据的Node列表*/
    _dataNodeList: SingletonList<INativeUploadNode> = new SingletonList();
    /**Describe Block of uploadMemory Cell nums*/
    _memoryBlockDescribe: NataiveMemory;

    _currentBlock: UploadMemory;

    _pool: UploadMemory[];

    private _uploadDataCell() {
        const elements = this._dataNodeList.elements;
        for (let i = 0; i < this._dataNodeList.length; i++) {
            let dataSize = elements[i].compressAllObject();//compress update data
            this.addUploadMemoryCell(elements[i], dataSize);//add block
        }
    }

    /**
     * @param node 
     */
    addUploadMemoryCell(node: INativeUploadNode, dataSize: number) {
        if(dataSize>UploadMemoryManager.UploadMemorySize)
            throw "dataSize is too large, greater than 10M,";
        let cellLength = dataSize + UploadMemoryCell.scriableLength;
        if (!this._currentBlock.check(cellLength)) {
            if(this._currentBlock._index==this._pool.length-1)
                this.createMemory();
            //use next
            this._currentBlock = this._pool[this._currentBlock._index+1];
        }
        this._currentBlock.addBlockCell(node,cellLength);
        this._memoryBlockDescribe.int32Array[this._currentBlock._index]+=1;
    }

    createMemory(): void {
        this._pool.push(new UploadMemory(UploadMemoryManager.UploadMemorySize, this._pool.length));
    }

    clear() {
        this._dataNodeList.length = 0;
        this._currentBlock = this._pool[0];
    }

    constructor() {
        UploadMemoryManager.BaseInstance = this;
        this._pool = [];
        this.createMemory();
        this._currentBlock = this._pool[0];
        this._memoryBlockDescribe = new NataiveMemory(100 * 4);
    }
}

export class UploadMemoryCell {
    //type + instanceID + dataLength
    static scriableLength: number = 3 * 4;
    //字节长度
    private _bytelength: number;
    //cell解析类型
    private _dataType: MemoryDataType;
    //实例化数据信息
    private _instanceInfo: number;
}