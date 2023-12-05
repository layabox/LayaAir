export class BPPromise {
    curIndex:number;

    static create():BPPromise{
        return new BPPromise();
    }

    private _completed:boolean;

    private _callback:(mis:BPPromise)=>void;
    /**
    * 等待行为完成回调
    * @param callback 完成回调接口
    */
    wait(callback: (mis:BPPromise)=>void): void {
        this._callback = callback;
        if (this._completed) {
            callback(this);
        }
    }

    complete(){
        this._completed=true;
        this._callback&&this._callback(this);
    }

    recover(){
        this.clear();
    }

    clear(){
        this._callback=null;
        this._completed=false;
    }

}