import { SubmitKey } from "./SubmitKey";
import { Value2D } from "../shader/d2/value/Value2D";
export class SubmitBase {
    constructor(renderType = SubmitBase.TYPE_2D) {
        this.clipInfoID = -1; //用来比较clipinfo
        /**@internal */
        this._mesh = null; //代替 _vb,_ib
        /**@internal */
        this._blendFn = null;
        this._id = 0;
        /**@internal */
        this._renderType = 0;
        /**@internal */
        this._parent = null;
        //渲染key，通过key判断是否是同一个
        /**@internal */
        this._key = new SubmitKey();
        // 从VB中什么地方开始画，画到哪
        /**@internal */
        this._startIdx = 0; //indexbuffer 的偏移，单位是byte
        /**@internal */
        this._numEle = 0;
        /**@internal */
        this._ref = 1; // 其实已经没有用了
        this.shaderValue = null;
        this._renderType = renderType;
        this._id = ++SubmitBase.ID;
    }
    static __init__() {
        var s = SubmitBase.RENDERBASE = new SubmitBase(-1);
        s.shaderValue = new Value2D(0, 0);
        s.shaderValue.ALPHA = 1;
        s._ref = 0xFFFFFFFF;
    }
    getID() {
        return this._id;
    }
    getRenderType() {
        return this._renderType;
    }
    toString() {
        return "ibindex:" + this._startIdx + " num:" + this._numEle + " key=" + this._key;
    }
    renderSubmit() { return 1; }
    releaseRender() { }
}
SubmitBase.TYPE_2D = 10000;
SubmitBase.TYPE_CANVAS = 10003;
SubmitBase.TYPE_CMDSETRT = 10004;
SubmitBase.TYPE_CUSTOM = 10005;
SubmitBase.TYPE_BLURRT = 10006;
SubmitBase.TYPE_CMDDESTORYPRERT = 10007;
SubmitBase.TYPE_DISABLESTENCIL = 10008;
SubmitBase.TYPE_OTHERIBVB = 10009;
SubmitBase.TYPE_PRIMITIVE = 10010;
SubmitBase.TYPE_RT = 10011;
SubmitBase.TYPE_BLUR_RT = 10012;
SubmitBase.TYPE_TARGET = 10013;
SubmitBase.TYPE_CHANGE_VALUE = 10014;
SubmitBase.TYPE_SHAPE = 10015;
SubmitBase.TYPE_TEXTURE = 10016;
SubmitBase.TYPE_FILLTEXTURE = 10017;
SubmitBase.KEY_ONCE = -1;
SubmitBase.KEY_FILLRECT = 1;
SubmitBase.KEY_DRAWTEXTURE = 2;
SubmitBase.KEY_VG = 3;
SubmitBase.KEY_TRIANGLES = 4;
SubmitBase.ID = 1;
SubmitBase.preRender = null; //上一个submit，主要用来比较key,以减少uniform的重复提交。
