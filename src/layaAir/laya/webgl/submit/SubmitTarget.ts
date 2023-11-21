import { ISubmit } from "./ISubmit";
import { SubmitKey } from "./SubmitKey";
import { ColorFilter } from "../../filters/ColorFilter"
import { Context } from "../../resource/Context"
import { RenderTexture2D } from "../../resource/RenderTexture2D"
import { BlendMode } from "../canvas/BlendMode"
import { TextureSV } from "../shader/d2/value/TextureSV"
import { Value2D } from "../shader/d2/value/Value2D"
import { Mesh2D } from "../utils/Mesh2D"
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { Const } from "../../Const";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector4 } from "../../maths/Vector4";
import { LayaGL } from "../../layagl/LayaGL";

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
        this._mesh.useMesh();

        var target = this.srcRT;
        if (target) {//??为什么会出现为空的情况
            this.shaderValue.textureHost = target;
            this.shaderValue.upload();
            this.blend();
            LayaGL.renderDrawContext.drawElements2DTemp(MeshTopology.Triangles, this._numEle, IndexFormat.UInt16, this._startIdx);
        }
        return 1;
    }

    blend(): void {
        if (BlendMode.activeBlendFunction !== BlendMode.fns[this.blendType]) {
            RenderStateContext.setBlend(true);
            BlendMode.fns[this.blendType]();
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
        o._startIdx = mesh.indexNum * Const.BYTES_PIDX;
        o._ref = 1;
        o._key.clear();
        o._numEle = 0;
        o.blendType = context._nBlendType;
        o._key.blendShader = o.blendType;
        o.shaderValue = sv;
        if (context._colorFiler) {
            var ft: ColorFilter = context._colorFiler;
            sv.defines.addDefine(ft.typeDefine);
            Matrix4x4.TEMPMatrix0.cloneByArray(ft._mat);
            (<TextureSV>sv).colorMat = Matrix4x4.TEMPMatrix0;
            Vector4.tempVec4.setValue(ft._alpha[0], ft._alpha[1], ft._alpha[2], ft._alpha[3]);
            (<TextureSV>sv).colorAlpha = Vector4.tempVec4;
        }
        return o;
    }
}

{
    (SubmitTarget.POOL as any)._length = 0;
}


