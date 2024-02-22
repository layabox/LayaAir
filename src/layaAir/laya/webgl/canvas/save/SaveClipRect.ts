import { ISaveData } from "./ISaveData";
import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix"
import { Rectangle } from "../../../maths/Rectangle"
import { Context } from "../../../renders/Context"

export class SaveClipRect implements ISaveData {

    private static POOL: any = SaveBase._createArray();

    _globalClipMatrix: Matrix = new Matrix();
    _clipInfoID: number = -1;
    _clipRect: Rectangle = new Rectangle();
    incache: boolean = false;

    isSaveMark(): boolean { return false; }

    restore(context: Context): void {
        this._globalClipMatrix.copyTo(context._globalClipMatrix);
        this._clipRect.clone(context._clipRect);
        context._clipInfoID = this._clipInfoID;
        SaveClipRect.POOL[SaveClipRect.POOL._length++] = this;
        context._clipInCache = this.incache;
    }

    static save(context: Context): void {
        if ((context._saveMark._saveuse & SaveBase.TYPE_CLIPRECT) == SaveBase.TYPE_CLIPRECT) return;
        context._saveMark._saveuse |= SaveBase.TYPE_CLIPRECT;
        var cache: any = SaveClipRect.POOL;
        var o: SaveClipRect = cache._length > 0 ? cache[--cache._length] : (new SaveClipRect());
        context._globalClipMatrix.copyTo(o._globalClipMatrix);
        context._clipRect.clone(o._clipRect);
        o._clipInfoID = context._clipInfoID;
        o.incache = context._clipInCache;
        var _save: any = context._save;
        _save[_save._length++] = o;
    }
}

