import { Const } from "../../Const";
import { ColorFilter } from "../../filters/ColorFilter";
import { Context } from "../../renders/Context";
import { Material } from "../../resource/Material";
import { Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
import { SubmitKey } from "./SubmitKey";

export class SubmitBase {
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

    _colorFiler:ColorFilter=null;
    shaderValue: Value2D = null;

    constructor() {
        this._id = ++SubmitBase.ID;
    }

    /*
       create方法只传对submit设置的值
     */
    static create(context: Context, mesh: Mesh2D, sv: Value2D): SubmitBase {
        var o = new SubmitBase();
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
        o._colorFiler = context._colorFiler;
        return o;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();

