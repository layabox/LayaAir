import { SubmitKey } from "././SubmitKey";
import { Stat } from "../../utils/Stat";
import { WebGLContext } from "../WebGLContext";
import { BlendMode } from "../canvas/BlendMode";
import { CONST3D2D } from "../utils/CONST3D2D";
export class SubmitTarget {
    constructor() {
        this.blendType = 0;
        this._ref = 1;
        this._key = new SubmitKey();
    }
    renderSubmit() {
        var gl = WebGLContext.mainContext;
        this._mesh.useMesh(gl);
        var target = this.srcRT;
        if (target) { //??为什么会出现为空的情况
            this.shaderValue.texture = target._getSource();
            this.shaderValue.upload();
            this.blend();
            Stat.renderBatches++;
            Stat.trianglesFaces += this._numEle / 3;
            WebGLContext.mainContext.drawElements(WebGLContext.TRIANGLES, this._numEle, WebGLContext.UNSIGNED_SHORT, this._startIdx);
        }
        return 1;
    }
    blend() {
        if (BlendMode.activeBlendFunction !== BlendMode.fns[this.blendType]) {
            var gl = WebGLContext.mainContext;
            gl.enable(WebGLContext.BLEND);
            BlendMode.fns[this.blendType](gl);
            BlendMode.activeBlendFunction = BlendMode.fns[this.blendType];
        }
    }
    getRenderType() {
        return 0;
    }
    releaseRender() {
        if ((--this._ref) < 1) {
            var pool = SubmitTarget.POOL;
            pool[pool._length++] = this;
        }
    }
    static create(context, mesh, sv, rt) {
        var o = SubmitTarget.POOL._length ? SubmitTarget.POOL[--SubmitTarget.POOL._length] : new SubmitTarget();
        o._mesh = mesh;
        o.srcRT = rt;
        o._startIdx = mesh.indexNum * CONST3D2D.BYTES_PIDX;
        o._ref = 1;
        o._key.clear();
        o._numEle = 0;
        o.blendType = context._nBlendType;
        o._key.blendShader = o.blendType;
        o.shaderValue = sv;
        o.shaderValue.setValue(context._shader2D);
        if (context._colorFiler) {
            var ft = context._colorFiler;
            sv.defines.add(ft.type);
            sv.colorMat = ft._mat;
            sv.colorAlpha = ft._alpha;
        }
        return o;
    }
}
SubmitTarget.POOL = [];
{
    SubmitTarget.POOL._length = 0;
}
