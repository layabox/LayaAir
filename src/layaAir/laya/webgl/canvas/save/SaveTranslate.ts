import { ISaveData } from "./ISaveData";
import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix"
import { Context } from "../../../renders/Context"
import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";

export class SaveTranslate implements ISaveData {


    private static POOL: any = SaveBase._createArray();
    /**@internal */
    _mat: Matrix = new Matrix();
    isSaveMark(): boolean { return false; }

    restore(runner: GraphicsRunner): void {
        this._mat.copyTo(runner._curMat);
        SaveTranslate.POOL[SaveTranslate.POOL._length++] = this;
    }

    static save(runner: GraphicsRunner): void {
        var no: any = SaveTranslate.POOL;
        var o: SaveTranslate = no._length > 0 ? no[--no._length] : (new SaveTranslate());
        runner._curMat.copyTo(o._mat);
        var _save: any = runner._save;
        _save[_save._length++] = o;
    }

}


