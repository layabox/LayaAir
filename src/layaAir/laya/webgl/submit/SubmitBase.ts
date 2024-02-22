import { WebGLRenderElement2D } from "../../RenderDriver/WebGLDriver/3DRenderPass/WebGLRenderElement2D";
import { Laya3DRender } from "../../d3/RenderObjs/Laya3DRender";
import { RenderSpriteData, Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
import { ISubmit } from "./ISubmit";
import { SubmitKey } from "./SubmitKey";

export class SubmitBase implements ISubmit {
    static TYPE_2D = 10000;
    static TYPE_CANVAS = 10003;
    static TYPE_CMDSETRT = 10004;
    static TYPE_CUSTOM = 10005;
    static TYPE_BLURRT = 10006;
    static TYPE_CMDDESTORYPRERT = 10007;
    static TYPE_DISABLESTENCIL = 10008;
    static TYPE_OTHERIBVB = 10009;
    static TYPE_PRIMITIVE = 10010;
    static TYPE_RT = 10011;
    static TYPE_BLUR_RT = 10012;
    static TYPE_TARGET = 10013;
    static TYPE_CHANGE_VALUE = 10014;
    static TYPE_SHAPE = 10015;
    static TYPE_TEXTURE = 10016;
    static TYPE_FILLTEXTURE = 10017;

    static KEY_ONCE = -1;
    static KEY_FILLRECT = 1;
    static KEY_DRAWTEXTURE = 2;
    static KEY_VG = 3;
    static KEY_TRIANGLES = 4;

    static RENDERBASE: SubmitBase;
    static ID = 1;
    static preRender: ISubmit = null;	//上一个submit，主要用来比较key,以减少uniform的重复提交。

    clipInfoID = -1;	//用来比较clipinfo
    /**@internal */
    _mesh: Mesh2D | null = null;			//代替 _vb,_ib
    /**@internal */
    _blendFn: Function = null;
    protected _id = 0;
    /**@internal */
    _renderType = 0;
    /**@internal */
    _parent: ISubmit = null;
    //渲染key，通过key判断是否是同一个
    /**@internal */
    _key = new SubmitKey();

    // 从VB中什么地方开始画，画到哪
    /**@internal */
    _startIdx = 0;		//indexbuffer 的偏移，单位是byte
    /**@internal */
    _numEle = 0;
    /**@internal */
    _ref = 1;	// 其实已经没有用了

    shaderValue: Value2D = null;

    renderObj:WebGLRenderElement2D

    static __init__(): void {
        var s: SubmitBase = SubmitBase.RENDERBASE = new SubmitBase(-1);
        s.shaderValue = new Value2D(RenderSpriteData.Zero);
        s._ref = 0xFFFFFFFF;
    }

    constructor(renderType = SubmitBase.TYPE_2D) {
        this._renderType = renderType;
        this._id = ++SubmitBase.ID;

        //this.renderObj = Laya3DRender.Render3DPassFactory.createRenderElement2D() as WebGLRenderElement2D;
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


