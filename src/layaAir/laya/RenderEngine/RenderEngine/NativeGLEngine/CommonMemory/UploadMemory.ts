import { MemoryDataType } from "./MemoryDataType";
import { NataiveMemory } from "./NativeMemory";

export class UploadMemory extends NataiveMemory{
    /**
     * 每次扩展的byte数，默认为5M
     */
    static stepExpand = 1024*1024*5;
    /**缓存本帧要更新，下沉的数据 */
    private _cellArray: UploadMemoryCell[];
    private _cellLength:number = 0;
    //为了不频繁扩缩Array，采用length标记记录
    private _pool:UploadMemoryCell[];
    private _poolLength:number = 0;

    private _currentStride:number = 0;

    constructor(size:number){
        super(size);
        this._cellArray = [];
        this._pool = [];
    }

    /**
     * 创建内存提交块
     */
    createCell(data:Uint8Array|Uint16Array|Uint32Array|Int32Array|Float32Array,dataType:MemoryDataType):UploadMemoryCell{
        let cell:UploadMemoryCell;
        if(this._poolLength>0)
            cell = this._pool[--this._poolLength];
        else
            cell = new UploadMemoryCell(this,data,this._currentStride,dataType);
        //TODO setData
        this.setData(data,this._currentStride);
        this._currentStride+=data.byteLength;
        
        this._cellArray.push(cell);
        this._cellLength++;
        return cell;
    }

    recoverCell(cell:UploadMemoryCell){
        if(this._poolLength==this._pool.length){
            this._pool.push(cell);
            this._poolLength++;
        }else{
            this._pool[this._poolLength++] = cell;
        }
    }

    /**
     * 清空更新数据
     */
    clear(): void {
        for(let i = 0;i<this._cellLength;i++){
            this.recoverCell(this._cellArray[i]);
        }
    }


}


export class UploadMemoryCell{
    //buffer中的偏移
    private _stride:number;
    //字节长度
    private _bytelength:number;
    //上传数据
    private _owner:UploadMemory;
    //cell解析类型
    private _dataType:MemoryDataType;

    constructor(mem:UploadMemory,data:Uint8Array|Uint16Array|Uint32Array|Int32Array|Float32Array,stride:number,dataType:MemoryDataType){
        this._stride = stride;
        this._owner = mem;
        this._bytelength = data.byteLength;
        this._dataType = dataType
    }
    
}