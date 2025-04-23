import { ISaveData } from "./ISaveData";
import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix"
import { Context } from "../../../renders/Context"
import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";

export class SaveTransform implements ISaveData {


    private static POOL: any = SaveBase._createArray();
    /**@internal */
    _savematrix: Matrix;
    /**@internal */
    _matrix: Matrix = new Matrix();

    constructor() {
    }

    isSaveMark(): boolean { return false; }

    restore(runner: GraphicsRunner): void {
        runner._curMat = this._savematrix;
        SaveTransform.POOL[SaveTransform.POOL._length++] = this;
    }

    static save(runner: GraphicsRunner): void {
        var _saveMark: any = runner._saveMark;
        if ((_saveMark._saveuse & SaveBase.TYPE_TRANSFORM) === SaveBase.TYPE_TRANSFORM) return;
        _saveMark._saveuse |= SaveBase.TYPE_TRANSFORM;
        var no: any = SaveTransform.POOL;
        var o: SaveTransform = no._length > 0 ? no[--no._length] : (new SaveTransform());
        o._savematrix = runner._curMat;
        runner._curMat = runner._curMat.copyTo(o._matrix);
        var _save: any = runner._save;
        _save[_save._length++] = o;
    }
}

