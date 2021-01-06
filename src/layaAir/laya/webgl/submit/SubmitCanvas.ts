import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D";
import { Value2D } from "../shader/d2/value/Value2D";
import { CONST3D2D } from "../utils/CONST3D2D";
import { RenderState2D } from "../utils/RenderState2D";
import { SubmitBase } from "./SubmitBase";

/**
 * cache as normal 模式下的生成的canvas的渲染。
 */

export class SubmitCanvas extends SubmitBase {
    /**@internal */
    _matrix: Matrix = new Matrix();		// 用来计算当前的世界矩阵
    canv: Context;
    /**@internal */
    _matrix4: any[] = CONST3D2D.defaultMatrix4.concat();

    static POOL: SubmitCanvas[] = [];

    static create(canvas: any, alpha: number, filters: any[]): SubmitCanvas {
        var o = (!(SubmitCanvas.POOL as any)._length) ? (new SubmitCanvas()) : SubmitCanvas.POOL[--(SubmitCanvas.POOL as any)._length];
        o.canv = canvas;
        o._ref = 1;
        o._numEle = 0;
        var v: Value2D = o.shaderValue;
        v.alpha = alpha;
        v.defines.setValue(0);
        filters && filters.length && v.setFilters(filters);
        return o;
    }

    constructor() {
        super(SubmitBase.TYPE_2D);
        this.shaderValue = new Value2D(0, 0);
    }

	/**
	 * @override
	 */
    renderSubmit(): number {
        // 下面主要是为了给canvas设置矩阵。因为canvas保存的是没有偏移的。
        var preAlpha = RenderState2D.worldAlpha;
        var preMatrix4 = RenderState2D.worldMatrix4;
        var preMatrix = RenderState2D.worldMatrix;

        var preFilters: any[] = RenderState2D.worldFilters;
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
        (this.canv as any)['flushsubmit']();
        RenderState2D.worldAlpha = preAlpha;
        RenderState2D.worldMatrix4 = preMatrix4;
        RenderState2D.worldMatrix.destroy();
        RenderState2D.worldMatrix = preMatrix;

        RenderState2D.worldFilters = preFilters;
        RenderState2D.worldShaderDefines = preWorldShaderDefines;
        return 1;
    }
    /**
     * @override
     */
    releaseRender(): void {
        if ((--this._ref) < 1) {
            var cache = SubmitCanvas.POOL;
            //_vb = null;
            this._mesh = null;
            cache[(cache as any)._length++] = this;
        }
    }
    /**
     * @override
     */
    getRenderType(): number {
        return SubmitBase.TYPE_CANVAS;
    }

}
{ (SubmitCanvas.POOL as any)._length = 0 }
