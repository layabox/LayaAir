import { Stat } from "../../utils/Stat";
import { BlendMode } from "../canvas/BlendMode";
import { CONST3D2D } from "../utils/CONST3D2D";
import { WebGLContext } from "../WebGLContext";
import { SubmitBase } from "./SubmitBase";
export class Submit extends SubmitBase {
    constructor(renderType = SubmitBase.TYPE_2D) {
        super(renderType);
    }
    /*override*/ renderSubmit() {
        if (this._numEle === 0 || !this._mesh || this._numEle == 0)
            return 1; //怎么会有_numEle是0的情况?
        var _tex = this.shaderValue.textureHost;
        if (_tex) {
            var source = _tex._getSource();
            if (!source)
                return 1;
            this.shaderValue.texture = source;
        }
        var gl = WebGLContext.mainContext;
        this._mesh.useMesh(gl);
        //_ib._bind_upload() || _ib._bind();
        //_vb._bind_upload() || _vb._bind();
        this.shaderValue.upload();
        if (BlendMode.activeBlendFunction !== this._blendFn) {
            WebGLContext.setBlend(gl, true);
            this._blendFn(gl);
            BlendMode.activeBlendFunction = this._blendFn;
        }
        gl.drawElements(WebGL2RenderingContext.TRIANGLES, this._numEle, WebGL2RenderingContext.UNSIGNED_SHORT, this._startIdx);
        Stat.renderBatches++;
        Stat.trianglesFaces += this._numEle / 3;
        return 1;
    }
    /*override*/ releaseRender() {
        if (SubmitBase.RENDERBASE == this)
            return;
        if ((--this._ref) < 1) {
            Submit.POOL[Submit._poolSize++] = this;
            this.shaderValue.release();
            this.shaderValue = null;
            //_vb = null;
            //_mesh.destroy();
            this._mesh = null;
            this._parent && (this._parent.releaseRender(), this._parent = null);
        }
    }
    /*
       create方法只传对submit设置的值
     */
    static create(context, mesh, sv) {
        var o = Submit._poolSize ? Submit.POOL[--Submit._poolSize] : new Submit();
        o._ref = 1;
        o._mesh = mesh;
        o._key.clear();
        o._startIdx = mesh.indexNum * CONST3D2D.BYTES_PIDX;
        o._numEle = 0;
        var blendType = context._nBlendType;
        o._blendFn = context._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
        o.shaderValue = sv;
        o.shaderValue.setValue(context._shader2D);
        var filters = context._shader2D.filters;
        filters && o.shaderValue.setFilters(filters);
        return o;
    }
    /**
     * 创建一个矢量submit
     * @param	ctx
     * @param	mesh
     * @param	numEle		对应drawElement的第二个参数:count
     * @param	offset		drawElement的时候的ib的偏移。
     * @param	sv			Value2D
     * @return
     */
    static createShape(ctx, mesh, numEle, sv) {
        var o = Submit._poolSize ? Submit.POOL[--Submit._poolSize] : (new Submit());
        o._mesh = mesh;
        o._numEle = numEle;
        o._startIdx = mesh.indexNum * 2;
        o._ref = 1;
        o.shaderValue = sv;
        o.shaderValue.setValue(ctx._shader2D);
        var blendType = ctx._nBlendType;
        o._key.blendShader = blendType;
        o._blendFn = ctx._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
        return o;
    }
}
Submit._poolSize = 0;
Submit.POOL = [];
