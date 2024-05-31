import { ColorFilter } from "../../filters/ColorFilter"
import { Matrix } from "../../maths/Matrix"
import { Context } from "../../renders/Context"
import { Texture } from "../../resource/Texture"
import { RenderSpriteData, Value2D } from "../shader/d2/value/Value2D"
import { MeshQuadTexture } from "../utils/MeshQuadTexture"
import { RenderInfo } from "../../renders/RenderInfo";
import { SubmitBase } from "../submit/SubmitBase"
/**
 * ...
 * @author laoxie
 */
export class CharSubmitCache {
    private static __posPool: any[] = [];
    private static __nPosPool: number = 0;

    private _data: any[] = [];
    private _ndata: number = 0;
    private _tex: Texture;
    private _imgId: number;
    private _clipid: number = -1;
    private _clipMatrix: Matrix = new Matrix();
    /**@internal */
    _enable: boolean = false;
    /**@internal */
    _colorFiler: ColorFilter;

    constructor() {

    }

    clear(): void {
        this._tex = null;
        this._imgId = -1;
        this._ndata = 0;
        this._enable = false;
        this._colorFiler = null;
    }

    destroy(): void {
        this.clear();
        this._data.length = 0;
        this._data = null;
    }

    add(ctx: Context, tex: Texture, imgid: number, pos: any[], uv: ArrayLike<number>, color: number): void {
        if (this._ndata > 0 && (this._tex != tex || this._imgId != imgid ||
            (this._clipid >= 0 && this._clipid != ctx._clipInfoID))) {
            this.submit(ctx);
        }

        this._clipid = ctx._clipInfoID;
        ctx._globalClipMatrix.copyTo(this._clipMatrix);
        this._tex = tex;
        this._imgId = imgid;
        this._colorFiler = ctx._colorFiler;

        this._data[this._ndata] = pos;
        this._data[this._ndata + 1] = uv;
        this._data[this._ndata + 2] = color;
        this._ndata += 3;
    }

    getPos(): any[] {
        if (CharSubmitCache.__nPosPool == 0)
            return new Array(8);
        return CharSubmitCache.__posPool[--CharSubmitCache.__nPosPool];
    }

    enable(value: boolean, ctx: Context): void {
        if (value === this._enable)
            return;
        this._enable = value;
        this._enable || this.submit(ctx);
    }

    submit(ctx: Context): void {
        var n = this._ndata;
        if (!n)
            return;

        ctx.drawLeftData();
        let shaderValue = Value2D.create(RenderSpriteData.Texture2D);
        //@ts-ignore
        ctx.fillShaderValue(shaderValue);
        shaderValue.textureHost = this._tex;
        //@ts-ignore
        let _mesh = ctx._mesh = ctx._meshQuatTex
        //@ts-ignore
        let submit = ctx._curSubmit = SubmitBase.create(ctx, _mesh, shaderValue);
        submit._key.other = this._imgId;
        submit._colorFiler = this._colorFiler;
        ctx._copyClipInfo(submit.shaderValue);
        submit.clipInfoID = this._clipid;

        for (var i = 0; i < n; i += 3) {
            _mesh.addQuad(this._data[i], this._data[i + 1], this._data[i + 2], true);
            CharSubmitCache.__posPool[CharSubmitCache.__nPosPool++] = this._data[i];
        }

        this._ndata = 0;

        if (RenderInfo.loopCount % 100 == 0)
            this._data.length = 0;
        ctx.drawLeftData();
    }

}


