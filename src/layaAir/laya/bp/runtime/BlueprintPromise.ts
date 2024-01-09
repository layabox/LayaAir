import { IExcuteListInfo } from "../core/interface/IExcuteListInfo";

export class BlueprintPromise implements IExcuteListInfo {
    /**
     * 在excuteAbleList中的索引
    */
    index: number;
    /**
     * excuteAbleList 的 map索引
    */
    listIndex: number | Symbol;

    static create(): BlueprintPromise {
        return new BlueprintPromise();
    }

    private _completed: boolean;

    private _callback: (mis: BlueprintPromise) => void;
    /**
    * 等待行为完成回调
    * @param callback 完成回调接口
    */
    wait(callback: (mis: BlueprintPromise) => void): void {
        this._callback = callback;
        if (this._completed) {
            callback(this);
        }
    }

    complete() {
        this._completed = true;
        this._callback && this._callback(this);
    }

    recover() {
        this.clear();
    }

    clear() {
        this._callback = null;
        this._completed = false;
    }

}