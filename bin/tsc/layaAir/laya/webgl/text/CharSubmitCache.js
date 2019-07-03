import { Matrix } from "../../maths/Matrix";
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D";
import { Value2D } from "../shader/d2/value/Value2D";
import { SubmitTexture } from "../submit/SubmitTexture";
import { RenderInfo } from "../../renders/RenderInfo";
/**
 * ...
 * @author laoxie
 */
export class CharSubmitCache {
    constructor() {
        this._data = [];
        this._ndata = 0;
        this._clipid = -1;
        this._clipMatrix = new Matrix();
        /**@internal */
        this._enbale = false;
    }
    clear() {
        this._tex = null;
        this._imgId = -1;
        this._ndata = 0;
        this._enbale = false;
        this._colorFiler = null;
    }
    destroy() {
        this.clear();
        this._data.length = 0;
        this._data = null;
    }
    add(ctx, tex, imgid, pos, uv, color) {
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
    getPos() {
        if (CharSubmitCache.__nPosPool == 0)
            return new Array(8);
        return CharSubmitCache.__posPool[--CharSubmitCache.__nPosPool];
    }
    enable(value, ctx) {
        if (value === this._enbale)
            return;
        this._enbale = value;
        this._enbale || this.submit(ctx);
    }
    submit(ctx) {
        var n = this._ndata;
        if (!n)
            return;
        var _mesh = ctx._mesh;
        var colorFiler = ctx._colorFiler;
        ctx._colorFiler = this._colorFiler;
        var submit = SubmitTexture.create(ctx, _mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
        ctx._submits[ctx._submits._length++] = ctx._curSubmit = submit;
        submit.shaderValue.textureHost = this._tex;
        submit._key.other = this._imgId;
        ctx._colorFiler = colorFiler;
        ctx._copyClipInfo(submit, this._clipMatrix);
        submit.clipInfoID = this._clipid;
        for (var i = 0; i < n; i += 3) {
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
CharSubmitCache.__posPool = [];
CharSubmitCache.__nPosPool = 0;
