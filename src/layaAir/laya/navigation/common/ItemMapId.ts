
/**
 * @internal
 * 一个用于映射对象和id的类
 */
export class ItemMapId<T> {
    /**@internal */
    private _idMap: Map<T, number>;
    private _idArray: Array<number>;
    constructor(maxCount:number){
        this._idMap = new Map();
        this._idArray = new Array();
        for(var i=0;i<maxCount;i++){
            this._idArray.push(i);
        }
    }

    public haveId():boolean{
        return this._idArray.length>0;
    }

    public getId(value:T):number{
        if(this._idMap.has(value)){
            return this._idMap.get(value);
        }
        if(this._idArray.length>0){
            let id = this._idArray.shift();
            this._idMap.set(value,id);
            return id;
        }
        return -1;
    }

    public removeItem(value:T):number{
        if(this._idMap.has(value)){
            let id = this._idMap.get(value);
            this._idArray.push(id);
            this._idMap.delete(value);
            this._idArray.sort((a,b)=>{return a-b});
            return id;
        }else{
            return -1;
        }
    }
}
