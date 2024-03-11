import { Const } from "../../Const";
import { Context } from "../../renders/Context";
import { Material } from "../../resource/Material";
import { RenderSpriteData, Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
import { SubmitKey } from "./SubmitKey";

export class SubmitBase {
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

    clipInfoID = -1;	//用来比较clipinfo
    blendType=-1;
    protected _id = 0;
    /**@internal */
    _renderType = 0;
    //渲染key，通过key判断是否是同一个
    /**@internal */
    _key = new SubmitKey();
    _mesh:Mesh2D;
    material:Material;

    // 从VB中什么地方开始画，画到哪
    /**@internal */
    _startIdx = 0;		//indexbuffer 的偏移，单位是byte
    /**@internal */
    _numEle = 0;

    shaderValue: Value2D = null;

    static __init__(): void {
        var s: SubmitBase = SubmitBase.RENDERBASE = new SubmitBase(-1);
        s.shaderValue = new Value2D(RenderSpriteData.Zero);
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

    /*
       create方法只传对submit设置的值
     */
    static create(context: Context, mesh: Mesh2D, sv: Value2D): SubmitBase {
        var o = new SubmitBase(SubmitBase.TYPE_TEXTURE);
        o._mesh = mesh;
        o._key.clear();
        o._key.submitType = SubmitBase.KEY_DRAWTEXTURE;
        o._startIdx = mesh.indexNum * Const.INDEX_BYTES;
        o._numEle = 0;
        var blendType = context._nBlendType;
        o._key.blendShader = blendType;
        o.shaderValue = sv;
        o.material = context.material;
        //sv.setValue(context._shader2D);
        return o;
    }

}


