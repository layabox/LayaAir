import { Matrix } from "../../maths/Matrix";
import { Value2D } from "../shader/d2/value/Value2D";
import { CONST3D2D } from "../utils/CONST3D2D";
import { RenderState2D } from "../utils/RenderState2D";
import { SubmitBase } from "././SubmitBase";
/**
 * cache as normal 模式下的生成的canvas的渲染。
 */
export class SubmitCanvas extends SubmitBase {
    constructor() {
        super(SubmitBase.TYPE_2D);
        this._matrix = new Matrix(); // 用来计算当前的世界矩阵
        this._matrix4 = CONST3D2D.defaultMatrix4.concat();
        this.shaderValue = new Value2D(0, 0);
    }
    static create(canvas, alpha, filters) {
        var o = (!SubmitCanvas.POOL._length) ? (new SubmitCanvas()) : SubmitCanvas.POOL[--SubmitCanvas.POOL._length];
        o.canv = canvas;
        o._ref = 1;
        o._numEle = 0;
        var v = o.shaderValue;
        v.alpha = alpha;
        v.defines.setValue(0);
        filters && filters.length && v.setFilters(filters);
        return o;
    }
    /*override*/ renderSubmit() {
        // 下面主要是为了给canvas设置矩阵。因为canvas保存的是没有偏移的。
        var preAlpha = RenderState2D.worldAlpha;
        var preMatrix4 = RenderState2D.worldMatrix4;
        var preMatrix = RenderState2D.worldMatrix;
        var preFilters = RenderState2D.worldFilters;
        var preWorldShaderDefines = RenderState2D.worldShaderDefines;
        var v = this.shaderValue;
        var m = this._matrix;
        var m4 = this._matrix4;
        var mout = Matrix.TEMP;
        Matrix.mul(m, preMatrix, mout);
        m4[0] = mout.a;
        m4[1] = mout.b;
        m4[4] = mout.c;
        m4[5] = mout.d;
        m4[12] = mout.tx;
        m4[13] = mout.ty;
        RenderState2D.worldMatrix = mout.clone();
        RenderState2D.worldMatrix4 = m4;
        RenderState2D.worldAlpha = RenderState2D.worldAlpha * v.alpha;
        if (v.filters && v.filters.length) {
            RenderState2D.worldFilters = v.filters;
            RenderState2D.worldShaderDefines = v.defines;
        }
        this.canv['flushsubmit']();
        RenderState2D.worldAlpha = preAlpha;
        RenderState2D.worldMatrix4 = preMatrix4;
        RenderState2D.worldMatrix.destroy();
        RenderState2D.worldMatrix = preMatrix;
        RenderState2D.worldFilters = preFilters;
        RenderState2D.worldShaderDefines = preWorldShaderDefines;
        return 1;
    }
    /*override*/ releaseRender() {
        if ((--this._ref) < 1) {
            var cache = SubmitCanvas.POOL;
            //_vb = null;
            this._mesh = null;
            cache[cache._length++] = this;
        }
    }
    /*override*/ getRenderType() {
        return SubmitBase.TYPE_CANVAS;
    }
    ;
}
SubmitCanvas.POOL = [];
{
    SubmitCanvas.POOL._length = 0;
}
