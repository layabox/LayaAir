import { ISubmit } from "./ISubmit";
import { SubmitKey } from "./SubmitKey";
import { ColorFilter } from "../../filters/ColorFilter"
import { Context } from "../../resource/Context"
import { RenderTexture2D } from "../../resource/RenderTexture2D"
import { Stat } from "../../utils/Stat"
import { WebGLContext } from "../WebGLContext"
import { BlendMode } from "../canvas/BlendMode"
import { TextureSV } from "../shader/d2/value/TextureSV"
import { Value2D } from "../shader/d2/value/Value2D"
import { CONST3D2D } from "../utils/CONST3D2D"
import { Mesh2D } from "../utils/Mesh2D"


export class SubmitTarget implements ISubmit {
    /**@internal */
    _mesh: Mesh2D;			//代替 _vb,_ib
    /**@internal */
    _startIdx: number;
    /**@internal */
    _numEle: number;
    shaderValue: Value2D;
    blendType: number = 0;
    /**@internal */
    _ref: number = 1;
    /**@internal */
    _key: SubmitKey = new SubmitKey();
    srcRT: RenderTexture2D;

    constructor() {
    }

    static POOL: SubmitTarget[] = [];
    renderSubmit(): number {
        var gl = WebGLContext.mainContext;
        this._mesh.useMesh(gl);

        var target = this.srcRT;
        if (target) {//??为什么会出现为空的情况
            this.shaderValue.texture = target._getSource();
            this.shaderValue.upload();
            this.blend();
            Stat.renderBatches++;
            Stat.trianglesFaces += this._numEle / 3;
            gl.drawElements(gl.TRIANGLES, this._numEle, gl.UNSIGNED_SHORT, this._startIdx);
        }
        return 1;
    }

    blend(): void {
        if (BlendMode.activeBlendFunction !== BlendMode.fns[this.blendType]) {
            var gl = WebGLContext.mainContext;
            gl.enable(gl.BLEND);
            BlendMode.fns[this.blendType](gl);
            BlendMode.activeBlendFunction = BlendMode.fns[this.blendType];
        }
    }

    getRenderType(): number {
        return 0;
    }

    releaseRender(): void {
        if ((--this._ref) < 1) {
            var pool: any = SubmitTarget.POOL;
            pool[pool._length++] = this;
        }
    }

    static create(context: Context, mesh: Mesh2D, sv: Value2D, rt: RenderTexture2D): SubmitTarget {
        var o: SubmitTarget = (SubmitTarget.POOL as any)._length ? SubmitTarget.POOL[--(SubmitTarget.POOL as any)._length] : new SubmitTarget();
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
            var ft: ColorFilter = context._colorFiler;
            sv.defines.add(ft.type);
            (<TextureSV>sv).colorMat = ft._mat;
            (<TextureSV>sv).colorAlpha = ft._alpha;
        }
        return o;
    }
}

{
    (SubmitTarget.POOL as any)._length = 0;
}


