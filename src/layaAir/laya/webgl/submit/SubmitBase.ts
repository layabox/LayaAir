import { ISubmit } from "./ISubmit";
import { SubmitKey } from "./SubmitKey";
import { Value2D } from "../shader/d2/value/Value2D"
import { Mesh2D } from "../utils/Mesh2D"

export class SubmitBase implements ISubmit {

    static TYPE_2D: number = 10000;
    static TYPE_CANVAS: number = 10003;
    static TYPE_CMDSETRT: number = 10004;
    static TYPE_CUSTOM: number = 10005;
    static TYPE_BLURRT: number = 10006;
    static TYPE_CMDDESTORYPRERT: number = 10007;
    static TYPE_DISABLESTENCIL: number = 10008;
    static TYPE_OTHERIBVB: number = 10009;
    static TYPE_PRIMITIVE: number = 10010;
    static TYPE_RT: number = 10011;
    static TYPE_BLUR_RT: number = 10012;
    static TYPE_TARGET: number = 10013;
    static TYPE_CHANGE_VALUE: number = 10014;
    static TYPE_SHAPE: number = 10015;
    static TYPE_TEXTURE: number = 10016;
    static TYPE_FILLTEXTURE: number = 10017;

    static KEY_ONCE: number = -1;
    static KEY_FILLRECT: number = 1;
    static KEY_DRAWTEXTURE: number = 2;
    static KEY_VG: number = 3;
    static KEY_TRIANGLES: number = 4;

    static RENDERBASE: SubmitBase;
    static ID: number = 1;
    static preRender: ISubmit = null;	//上一个submit，主要用来比较key,以减少uniform的重复提交。

    clipInfoID: number = -1;	//用来比较clipinfo
    /**@internal */
    _mesh: Mesh2D|null = null;			//代替 _vb,_ib
    /**@internal */
    _blendFn: Function = null;
    protected _id: number = 0;
    /**@internal */
    _renderType: number = 0;
    /**@internal */
    _parent: ISubmit = null;
    //渲染key，通过key判断是否是同一个
    /**@internal */
    _key: SubmitKey = new SubmitKey();

    // 从VB中什么地方开始画，画到哪
    /**@internal */
    _startIdx: number = 0;		//indexbuffer 的偏移，单位是byte
    /**@internal */
    _numEle: number = 0;
    /**@internal */
    _ref: number = 1;	// 其实已经没有用了

    shaderValue: Value2D = null;

    static __init__(): void {
        var s: SubmitBase = SubmitBase.RENDERBASE = new SubmitBase(-1);
        s.shaderValue = new Value2D(0, 0);
        s.shaderValue.ALPHA = 1;
        s._ref = 0xFFFFFFFF;
    }

    constructor(renderType: number = SubmitBase.TYPE_2D) {
        this._renderType = renderType;
        this._id = ++SubmitBase.ID;
    }

    getID(): number {
        return this._id;
    }


    getRenderType(): number {
        return this._renderType;
    }

    toString(): string {
        return "ibindex:" + this._startIdx + " num:" + this._numEle + " key=" + this._key;
    }

    renderSubmit(): number { return 1; }
    releaseRender(): void { }
}


