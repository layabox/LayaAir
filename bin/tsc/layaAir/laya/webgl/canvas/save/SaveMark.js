import { SaveBase } from "./SaveBase";
export class SaveMark {
    constructor() {
        /**@internal */
        this._saveuse = 0;
    }
    isSaveMark() {
        return true;
    }
    restore(context) {
        context._saveMark = this._preSaveMark;
        SaveMark.POOL[SaveMark.POOL._length++] = this;
    }
    static Create(context) {
        var no = SaveMark.POOL;
        var o = no._length > 0 ? no[--no._length] : (new SaveMark());
        o._saveuse = 0;
        o._preSaveMark = context._saveMark;
        context._saveMark = o;
        return o;
    }
}
SaveMark.POOL = SaveBase._createArray();
