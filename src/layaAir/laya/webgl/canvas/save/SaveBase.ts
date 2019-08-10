import { ISaveData } from "./ISaveData";
import { Context } from "../../../resource/Context"
import { SubmitBase } from "../../submit/SubmitBase"

export class SaveBase implements ISaveData {

    /*[FILEINDEX:1]*/
    /*[DISBALEOUTCONST-BEGIN]*/
    static TYPE_ALPHA: number = 0x1;
    static TYPE_FILESTYLE: number = 0x2;
    static TYPE_FONT: number = 0x8;
    static TYPE_LINEWIDTH: number = 0x100;
    static TYPE_STROKESTYLE: number = 0x200;
    static TYPE_MARK: number = 0x400;
    static TYPE_TRANSFORM: number = 0x800;
    static TYPE_TRANSLATE: number = 0x1000;
    static TYPE_ENABLEMERGE: number = 0x2000;

    static TYPE_TEXTBASELINE: number = 0x4000;
    static TYPE_TEXTALIGN: number = 0x8000;
    static TYPE_GLOBALCOMPOSITEOPERATION: number = 0x10000;
    static TYPE_CLIPRECT: number = 0x20000;
    static TYPE_CLIPRECT_STENCIL: number = 0x40000;
    static TYPE_IBVB: number = 0x80000;
    static TYPE_SHADER: number = 0x100000;
    static TYPE_FILTERS: number = 0x200000;
    static TYPE_FILTERS_TYPE: number = 0x400000;
    static TYPE_COLORFILTER: number = 0x800000;
    /*[DISBALEOUTCONST-END]*/
    private static POOL: any = SaveBase._createArray();
    private static _namemap: any = SaveBase._init();
    /**@internal */
    static _createArray(): any[] {
        var value: any = [];
        value._length = 0;
        return value;
    }
    /**@internal */
    static _init(): any {
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

    private _valueName: string;
    private _value: any;
    private _dataObj: any;
    private _newSubmit: boolean;

    constructor() {
    }

    isSaveMark(): boolean { return false; }

    restore(context: Context): void {
        this._dataObj[this._valueName] = this._value;
        SaveBase.POOL[SaveBase.POOL._length++] = this;
        this._newSubmit && (context._curSubmit = SubmitBase.RENDERBASE);
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


