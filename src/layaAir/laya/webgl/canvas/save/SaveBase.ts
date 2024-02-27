import { ISaveData } from "./ISaveData";
import { Context } from "../../../renders/Context"
import { SubmitBase } from "../../submit/SubmitBase"

export class SaveBase implements ISaveData {
    static TYPE_ALPHA = 0x1;
    static TYPE_FILESTYLE = 0x2;
    static TYPE_FONT = 0x8;
    static TYPE_LINEWIDTH = 0x100;
    static TYPE_STROKESTYLE = 0x200;
    static TYPE_MARK = 0x400;
    static TYPE_TRANSFORM = 0x800;
    static TYPE_TRANSLATE = 0x1000;
    static TYPE_ENABLEMERGE = 0x2000;

    static TYPE_TEXTBASELINE = 0x4000;
    static TYPE_TEXTALIGN = 0x8000;
    static TYPE_GLOBALCOMPOSITEOPERATION = 0x10000;
    static TYPE_CLIPRECT = 0x20000;
    static TYPE_CLIPRECT_STENCIL = 0x40000;
    static TYPE_IBVB = 0x80000;
    static TYPE_SHADER = 0x100000;
    static TYPE_FILTERS = 0x200000;
    static TYPE_FILTERS_TYPE = 0x400000;
    static TYPE_COLORFILTER = 0x800000;
    private static POOL: any = SaveBase._createArray();
    private static _namemap: any = SaveBase._init();
    private _valueName: string;
    private _value: any;
    private _dataObj: any;
    private _newSubmit: boolean;

    constructor() {
    }

    /**@internal */
    static _createArray(): any[] {
        var value: any = [];
        value._length = 0;
        return value;
    }
    /**@internal */
    static _init() {
        var namemap: any = SaveBase._namemap = {};
        namemap[SaveBase.TYPE_ALPHA] = "ALPHA";
        namemap[SaveBase.TYPE_FILESTYLE] = "fillStyle";
        namemap[SaveBase.TYPE_FONT] = "font";
        namemap[SaveBase.TYPE_LINEWIDTH] = "lineWidth";
        namemap[SaveBase.TYPE_STROKESTYLE] = "strokeStyle";
        namemap[SaveBase.TYPE_ENABLEMERGE] = "_mergeID";
        namemap[SaveBase.TYPE_MARK] = namemap[SaveBase.TYPE_TRANSFORM] = namemap[SaveBase.TYPE_TRANSLATE] = [];
        namemap[SaveBase.TYPE_TEXTBASELINE] = "textBaseline";
        namemap[SaveBase.TYPE_TEXTALIGN] = "textAlign";
        namemap[SaveBase.TYPE_GLOBALCOMPOSITEOPERATION] = "_nBlendType";
        namemap[SaveBase.TYPE_SHADER] = "shader";
        namemap[SaveBase.TYPE_FILTERS] = "filters";
        namemap[SaveBase.TYPE_COLORFILTER] = '_colorFiler';
        return namemap;
    }

    isSaveMark(): boolean { return false; }

    restore(context: Context): void {
        this._dataObj[this._valueName] = this._value;
        SaveBase.POOL[SaveBase.POOL._length++] = this;
        this._newSubmit && (context.stopMerge = true);
    }

    static save(context: Context, type: number, dataObj: any, newSubmit: boolean): void {
        if ((context._saveMark._saveuse & type) !== type) {
            context._saveMark._saveuse |= type;
            var cache: any = SaveBase.POOL;
            var o: any = cache._length > 0 ? cache[--cache._length] : (new SaveBase());
            o._value = dataObj[o._valueName = SaveBase._namemap[type]];
            o._dataObj = dataObj;
            o._newSubmit = newSubmit;
            var _save: any = context._save;
            _save[_save._length++] = o;
        }
    }
}


