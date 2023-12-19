import { Const } from "../../Const";
import { Material } from "../../resource/Material";
import { LayaGL } from "../../layagl/LayaGL";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";
import { Context } from "../../resource/Context";
import { BlendMode } from "../canvas/BlendMode";
import { Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
import { SubmitBase } from "./SubmitBase";

export class Submit extends SubmitBase {

    protected static _poolSize: number = 0;
    protected static POOL: Submit[] = [];
    material: Material;
    constructor(renderType: number = SubmitBase.TYPE_2D) {
        super(renderType);
    }

    /**
     * @override
     */
    renderSubmit(): number {
        if (this._numEle === 0 || !this._mesh || this._numEle == 0) return 1;//怎么会有_numEle是0的情况?

        var _tex = this.shaderValue.textureHost;
        if (_tex) {
            var source: any = _tex._getSource();
            if (!source)
                return 1;
            this.shaderValue.texture = source;
        }

        this._mesh.useMesh();//bind 顶点
        this.shaderValue.upload(this.material);//绑定shader，uploadMaterial

        if (BlendMode.activeBlendFunction !== this._blendFn) {
            RenderStateContext.setBlend(true);
            this._blendFn();
            BlendMode.activeBlendFunction = this._blendFn;
        }
        LayaGL.renderDrawContext.drawElements2DTemp(MeshTopology.Triangles, this._numEle, IndexFormat.UInt16, this._startIdx);
        // Stat.renderBatches++;
        // Stat.trianglesFaces += this._numEle / 3;

        return 1;
    }

    /**
     * @override
     */
    releaseRender(): void {
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

    /**
     * create方法只传对submit设置的值
     */
    static create(context: Context, mesh: Mesh2D, sv: Value2D): Submit {
        var o = Submit._poolSize ? Submit.POOL[--Submit._poolSize] : new Submit();
        o._ref = 1;
        o._mesh = mesh;
        o._key.clear();
        o._startIdx = mesh.indexNum * Const.BYTES_PIDX;
        o._numEle = 0;
        var blendType = context._nBlendType;
        o._blendFn = context._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
        o.shaderValue = sv;
        o.material = context.material;
        var filters: any[] = context._shader2D.filters;
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
    static createShape(ctx: Context, mesh: Mesh2D, numEle: number, sv: Value2D): Submit {
        var o = Submit._poolSize ? Submit.POOL[--Submit._poolSize] : (new Submit());
        o._mesh = mesh;
        o._numEle = numEle;
        o._startIdx = mesh.indexNum * 2;
        o._ref = 1;
        o.shaderValue = sv;
        var blendType = ctx._nBlendType;
        o._key.blendShader = blendType;
        o.material = ctx.material;
        o._blendFn = ctx._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
        return o;
    }
}


