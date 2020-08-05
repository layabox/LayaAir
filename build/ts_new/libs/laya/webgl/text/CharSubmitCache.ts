import { ColorFilter } from "../../filters/ColorFilter"
import { Matrix } from "../../maths/Matrix"
import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D"
import { Value2D } from "../shader/d2/value/Value2D"
import { SubmitTexture } from "../submit/SubmitTexture"
import { MeshQuadTexture } from "../utils/MeshQuadTexture"
import { RenderInfo } from "../../renders/RenderInfo";
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
        var n: number = this._ndata;
        if (!n)
            return;

        var _mesh: MeshQuadTexture = ctx._mesh;

        var colorFiler: ColorFilter = ctx._colorFiler;
        ctx._colorFiler = this._colorFiler;
        var submit: SubmitTexture = SubmitTexture.create(ctx, _mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
        ctx._submits[ctx._submits._length++] = ctx._curSubmit = submit;
        submit.shaderValue.textureHost = this._tex;
        submit._key.other = this._imgId;
        ctx._colorFiler = colorFiler;
        ctx._copyClipInfo(submit, this._clipMatrix);
        submit.clipInfoID = this._clipid;

        for (var i: number = 0; i < n; i += 3) {
            _mesh.addQuad(this._data[i], this._data[i + 1], this._data[i + 2], true);
            CharSubmitCache.__posPool[CharSubmitCache.__nPosPool++] = this._data[i];
        }

        n /= 3;
        submit._numEle += n * 6;
        _mesh.indexNum += n * 6;
        _mesh.vertNum += n * 4;
        ctx._drawCount += n;
        this._ndata = 0;

        if (RenderInfo.loopCount % 100 == 0)
            this._data.length = 0;
    }

}


