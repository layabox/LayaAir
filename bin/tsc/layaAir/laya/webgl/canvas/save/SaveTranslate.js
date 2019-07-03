import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix";
export class SaveTranslate {
    constructor() {
        /**@internal */
        this._mat = new Matrix();
    }
    isSaveMark() { return false; }
    restore(context) {
        this._mat.copyTo(context._curMat);
        SaveTranslate.POOL[SaveTranslate.POOL._length++] = this;
    }
    static save(context) {
        var no = SaveTranslate.POOL;
        var o = no._length > 0 ? no[--no._length] : (new SaveTranslate());
        context._curMat.copyTo(o._mat);
        var _save = context._save;
        _save[_save._length++] = o;
    }
}
SaveTranslate.POOL = SaveBase._createArray();
