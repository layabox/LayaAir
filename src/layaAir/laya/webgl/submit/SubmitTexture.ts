import { SubmitBase } from "./SubmitBase";
import { ColorFilter } from "../../filters/ColorFilter"
import { Context } from "../../resource/Context"
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
import { Material } from "../../resource/Material";
import { Laya } from "../../../Laya";
import { LayaGL } from "../../layagl/LayaGL";

export class SubmitTexture extends SubmitBase {
    private static _poolSize: number = 0;
    private static POOL: SubmitTexture[] = [];
    material: Material;
    constructor(renderType: number = SubmitBase.TYPE_2D) {
        super(renderType);
    }
    /**
     * @override
     */
    releaseRender(): void {
        if ((--this._ref) < 1) {
            SubmitTexture.POOL[SubmitTexture._poolSize++] = this;
            this.shaderValue.release();
            //_vb = null;
            this._mesh = null;		//下次create会重新赋值。既然会重新赋值，那还设置干嘛
            this._parent && (this._parent.releaseRender(), this._parent = null);
        }
    }

    renderSubmit(): number {
        if (this._numEle === 0)
            return 1;

        var tex = this.shaderValue.textureHost;
        if (tex) {//现在fillrect也用的这个submit，所以不必要求有texture
            var source: any = tex ? tex._getSource() : null;
            if (!source) return 1;
        }

        this._mesh.useMesh();//Mesh2D  ->    Geometry  Vao  Vb  ib

        //bind Shader uploadData
        this.shaderValue.updateShaderData();//Material   Shader   ShaderData

        //如果shader参数都相同，只要提交texture就行了
        var lastSubmit = <SubmitTexture>SubmitBase.preRender;
        var prekey = ((<SubmitBase>SubmitBase.preRender))._key;
        //         if (this._key.blendShader === 0 && (this._key.submitType === prekey.submitType && this._key.blendShader === prekey.blendShader) && BaseShader.activeShader &&
        //             (<SubmitBase>SubmitBase.preRender).clipInfoID == this.clipInfoID &&
        // //            lastSubmit.shaderValue.defines._value === this.shaderValue.defines._value && //shader define要相同. 
        //             (this.shaderValue.defines.hasDefine(ShaderDefines2D.FILTERGLOW) || this.shaderValue.defines.hasDefine(ShaderDefines2D.FILTERBLUR)
        //                 || this.shaderValue.defines.hasDefine(ShaderDefines2D.FILTERCOLOR) || this.shaderValue.defines.hasDefine(ShaderDefines2D.FILLTEXTURE))  //只有基本类型的shader走这个，像blur，glow，filltexture等都不要这样优化
        //         ) {
        //             (<Shader>BaseShader.activeShader).uploadTexture2D(source);
        //         }
        //         else {
        if (BlendMode.activeBlendFunction !== this._blendFn) {
            RenderStateContext.setBlend(true);
            this._blendFn();
            BlendMode.activeBlendFunction = this._blendFn;
        }
        this.shaderValue.texture = source;
        this.shaderValue.upload(this.material);//Update Uniform
        //}
        //Draw
        //LayaGL.renderDrawContext.drawElements2DTemp(MeshTopology.Triangles, this._numEle, IndexFormat.UInt16, this._startIdx);
        return 1;
    }

    /*
       create方法只传对submit设置的值
     */
    static create(context: Context, mesh: Mesh2D, sv: Value2D): SubmitTexture {
        var o = SubmitTexture._poolSize ? SubmitTexture.POOL[--SubmitTexture._poolSize] : new SubmitTexture(SubmitBase.TYPE_TEXTURE);
        o._mesh = mesh;
        o._key.clear();
        o._key.submitType = SubmitBase.KEY_DRAWTEXTURE;
        o._ref = 1;
        o._startIdx = mesh.indexNum * Const.BYTES_PIDX;
        o._numEle = 0;
        var blendType = context._nBlendType;
        o._key.blendShader = blendType;
        o._blendFn = context._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
        o.shaderValue = sv;
        o.material = context.material;
        //sv.setValue(context._shader2D);
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


