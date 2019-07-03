import { SubmitBase } from "../../submit/SubmitBase";
export class SaveBase {
    constructor() {
    }
    /**@internal */
    static _createArray() {
        var value = [];
        value._length = 0;
        return value;
    }
    /**@internal */
    static _init() {
        var namemap = SaveBase._namemap = {};
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
    isSaveMark() { return false; }
    restore(context) {
        this._dataObj[this._valueName] = this._value;
        SaveBase.POOL[SaveBase.POOL._length++] = this;
        this._newSubmit && (context._curSubmit = SubmitBase.RENDERBASE);
    }
    static save(context, type, dataObj, newSubmit) {
        if ((context._saveMark._saveuse & type) !== type) {
            context._saveMark._saveuse |= type;
            var cache = SaveBase.POOL;
            var o = cache._length > 0 ? cache[--cache._length] : (new SaveBase());
            o._value = dataObj[o._valueName = SaveBase._namemap[type]];
            o._dataObj = dataObj;
            o._newSubmit = newSubmit;
            var _save = context._save;
            _save[_save._length++] = o;
        }
    }
}
/*[FILEINDEX:1]*/
/*[DISBALEOUTCONST-BEGIN]*/
SaveBase.TYPE_ALPHA = 0x1;
SaveBase.TYPE_FILESTYLE = 0x2;
SaveBase.TYPE_FONT = 0x8;
SaveBase.TYPE_LINEWIDTH = 0x100;
SaveBase.TYPE_STROKESTYLE = 0x200;
SaveBase.TYPE_MARK = 0x400;
SaveBase.TYPE_TRANSFORM = 0x800;
SaveBase.TYPE_TRANSLATE = 0x1000;
SaveBase.TYPE_ENABLEMERGE = 0x2000;
SaveBase.TYPE_TEXTBASELINE = 0x4000;
SaveBase.TYPE_TEXTALIGN = 0x8000;
SaveBase.TYPE_GLOBALCOMPOSITEOPERATION = 0x10000;
SaveBase.TYPE_CLIPRECT = 0x20000;
SaveBase.TYPE_CLIPRECT_STENCIL = 0x40000;
SaveBase.TYPE_IBVB = 0x80000;
SaveBase.TYPE_SHADER = 0x100000;
SaveBase.TYPE_FILTERS = 0x200000;
SaveBase.TYPE_FILTERS_TYPE = 0x400000;
SaveBase.TYPE_COLORFILTER = 0x800000;
/*[DISBALEOUTCONST-END]*/
SaveBase.POOL = SaveBase._createArray();
SaveBase._namemap = SaveBase._init();
