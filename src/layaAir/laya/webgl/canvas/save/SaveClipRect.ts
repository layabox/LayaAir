import { ISaveData } from "./ISaveData";
import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix"
import { Rectangle } from "../../../maths/Rectangle"
import { Context } from "../../../renders/Context"
import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";

export class SaveClipRect implements ISaveData {

    private static POOL: any = SaveBase._createArray();

    _globalClipMatrix: Matrix = new Matrix();
    _clipInfoID: number = -1;
    _clipRect: Rectangle = new Rectangle();

    isSaveMark(): boolean { return false; }

    restore(runner: GraphicsRunner): void {
        this._globalClipMatrix.copyTo(runner._globalClipMatrix);
        this._clipRect.clone(runner._clipRect);
        runner._clipInfoID = this._clipInfoID;
        SaveClipRect.POOL[SaveClipRect.POOL._length++] = this;
    }

    static save(runner: GraphicsRunner): void {
        if ((runner._saveMark._saveuse & SaveBase.TYPE_CLIPRECT) == SaveBase.TYPE_CLIPRECT) return;
        runner._saveMark._saveuse |= SaveBase.TYPE_CLIPRECT;
        var cache: any = SaveClipRect.POOL;
        var o: SaveClipRect = cache._length > 0 ? cache[--cache._length] : (new SaveClipRect());
        runner._globalClipMatrix.copyTo(o._globalClipMatrix);
        runner._clipRect.clone(o._clipRect);
        o._clipInfoID = runner._clipInfoID;
        var _save: any = runner._save;
        _save[_save._length++] = o;
    }
}

