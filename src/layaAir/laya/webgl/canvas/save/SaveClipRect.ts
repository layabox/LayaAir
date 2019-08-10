import { ISaveData } from "./ISaveData";
import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix"
import { Rectangle } from "../../../maths/Rectangle"
import { Context } from "../../../resource/Context"

export class SaveClipRect implements ISaveData {


    private static POOL: any = SaveBase._createArray();

    //public var _clipSaveRect:Rectangle;
    //private var _transedClipInfo:Array = new Array(6);
    private _globalClipMatrix: Matrix = new Matrix();
    private _clipInfoID: number = -1;
    /**@internal */
    _clipRect: Rectangle = new Rectangle();
    incache: boolean = false;

    isSaveMark(): boolean { return false; }

    restore(context: Context): void {
        /*
        context._transedClipInfo[0] = _transedClipInfo[0];
        context._transedClipInfo[1] = _transedClipInfo[1];
        context._transedClipInfo[2] = _transedClipInfo[2];
        context._transedClipInfo[3] = _transedClipInfo[3];
        context._transedClipInfo[4] = _transedClipInfo[4];
        context._transedClipInfo[5] = _transedClipInfo[5];
        */
        this._globalClipMatrix.copyTo(context._globalClipMatrix);
        this._clipRect.clone(context._clipRect);
        context._clipInfoID = this._clipInfoID;
        //context._clipTransed = false;	//ֱ�����¼���
        SaveClipRect.POOL[SaveClipRect.POOL._length++] = this;
        context._clipInCache = this.incache;
        /*
        context._clipRect = _clipSaveRect;
        context._curSubmit = context._submits[context._submits._length++] = SubmitBase.RENDERBASE;
        context._submitKey.submitType=-1;
        */
    }

    static save(context: Context): void {
        if ((context._saveMark._saveuse & SaveBase.TYPE_CLIPRECT) == SaveBase.TYPE_CLIPRECT) return;
        context._saveMark._saveuse |= SaveBase.TYPE_CLIPRECT;
        var cache: any = SaveClipRect.POOL;
        var o: SaveClipRect = cache._length > 0 ? cache[--cache._length] : (new SaveClipRect());
        //o._clipSaveRect = context._clipRect;
        //context._clipRect = o._clipRect.copyFrom(context._clipRect);
        //o._submitScissor = submitScissor;
        context._globalClipMatrix.copyTo(o._globalClipMatrix);
        /*
        o._transedClipInfo[0] = context._transedClipInfo[0];
        o._transedClipInfo[1] = context._transedClipInfo[1];
        o._transedClipInfo[2] = context._transedClipInfo[2];
        o._transedClipInfo[3] = context._transedClipInfo[3];
        o._transedClipInfo[4] = context._transedClipInfo[4];
        o._transedClipInfo[5] = context._transedClipInfo[5];
        */
        context._clipRect.clone(o._clipRect);
        o._clipInfoID = context._clipInfoID;
        o.incache = context._clipInCache;
        var _save: any = context._save;
        _save[_save._length++] = o;
    }
}

