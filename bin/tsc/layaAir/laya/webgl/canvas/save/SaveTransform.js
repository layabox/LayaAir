import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix";
export class SaveTransform {
    constructor() {
        /**@internal */
        this._matrix = new Matrix();
    }
    isSaveMark() { return false; }
    restore(context) {
        context._curMat = this._savematrix;
        SaveTransform.POOL[SaveTransform.POOL._length++] = this;
    }
    static save(context) {
        var _saveMark = context._saveMark;
        if ((_saveMark._saveuse & SaveBase.TYPE_TRANSFORM) === SaveBase.TYPE_TRANSFORM)
            return;
        _saveMark._saveuse |= SaveBase.TYPE_TRANSFORM;
        var no = SaveTransform.POOL;
        var o = no._length > 0 ? no[--no._length] : (new SaveTransform());
        o._savematrix = context._curMat;
        context._curMat = context._curMat.copyTo(o._matrix);
        var _save = context._save;
        _save[_save._length++] = o;
    }
}
SaveTransform.POOL = SaveBase._createArray();
