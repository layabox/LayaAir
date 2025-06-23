import { ISaveData } from "./ISaveData";
import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix"
import { Rectangle } from "../../../maths/Rectangle"
import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";
import { Const } from "../../../Const";

/** @ignore */
export class SaveClipRect implements ISaveData {
    static MAX: Rectangle = new Rectangle(0, 0, Const.MAX_CLIP_SIZE, Const.MAX_CLIP_SIZE);

    private static POOL: any = SaveBase._createArray();

    _globalClipMatrix: Matrix = new Matrix();
    _clipInfoID: number = -1;
    _clipRect: Rectangle = new Rectangle();
    _clip_x: number = 0;
    _clip_y: number = 0;
    isSaveMark(): boolean { return false; }

    restore(runner: GraphicsRunner): void {
        if (
            this._clipRect.width == SaveClipRect.MAX.width
            && this._clipRect.height == SaveClipRect.MAX.height
            && this._clip_x == SaveClipRect.MAX.x
            && this._clip_y == SaveClipRect.MAX.y
        ) {
            runner._clipRect = SaveClipRect.MAX;
        } else {
            this._clipRect.clone(runner._clipRect);
        }
        runner._clip_x = this._clip_x;
        runner._clip_y = this._clip_y;
        this._globalClipMatrix.copyTo(runner._globalClipMatrix);
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
        o._clip_x = runner._clip_x;
        o._clip_y = runner._clip_y;
        var _save: any = runner._save;
        _save[_save._length++] = o;
    }
}

