import { SubmitBase } from "././SubmitBase";
import { Stat } from "../../utils/Stat";
import { WebGLContext } from "../WebGLContext";
import { BlendMode } from "../canvas/BlendMode";
import { BaseShader } from "../shader/BaseShader";
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D";
import { CONST3D2D } from "../utils/CONST3D2D";
export class SubmitTexture extends SubmitBase {
    constructor(renderType = SubmitBase.TYPE_2D) {
        super(renderType);
    }
    /*override*/ releaseRender() {
        if ((--this._ref) < 1) {
            SubmitTexture.POOL[SubmitTexture._poolSize++] = this;
            this.shaderValue.release();
            //_vb = null;
            this._mesh = null; //下次create会重新赋值。既然会重新赋值，那还设置干嘛
            this._parent && (this._parent.releaseRender(), this._parent = null);
        }
    }
    /*override*/ renderSubmit() {
        if (this._numEle === 0)
            return 1;
        var tex = this.shaderValue.textureHost;
        if (tex) { //现在fillrect也用的这个submit，所以不必要求有texture
            var source = tex ? tex._getSource() : null;
            if (!source)
                return 1;
        }
        var gl = WebGLContext.mainContext;
        this._mesh.useMesh(gl);
        //如果shader参数都相同，只要提交texture就行了
        var lastSubmit = SubmitBase.preRender;
        var prekey = SubmitBase.preRender._key;
        if (this._key.blendShader === 0 && (this._key.submitType === prekey.submitType && this._key.blendShader === prekey.blendShader) && BaseShader.activeShader &&
            SubmitBase.preRender.clipInfoID == this.clipInfoID &&
            lastSubmit.shaderValue.defines._value === this.shaderValue.defines._value && //shader define要相同. 
            (this.shaderValue.defines._value & ShaderDefines2D.NOOPTMASK) == 0 //只有基本类型的shader走这个，像blur，glow，filltexture等都不要这样优化
        ) {
            BaseShader.activeShader.uploadTexture2D(source);
        }
        else {
            if (BlendMode.activeBlendFunction !== this._blendFn) {
                WebGLContext.setBlend(gl, true);
                this._blendFn(gl);
                BlendMode.activeBlendFunction = this._blendFn;
            }
            this.shaderValue.texture = source;
            this.shaderValue.upload();
        }
        gl.drawElements(WebGLContext.TRIANGLES, this._numEle, WebGLContext.UNSIGNED_SHORT, this._startIdx);
        Stat.renderBatches++;
        Stat.trianglesFaces += this._numEle / 3;
        return 1;
    }
    /*
       create方法只传对submit设置的值
     */
    static create(context, mesh, sv) {
        var o = SubmitTexture._poolSize ? SubmitTexture.POOL[--SubmitTexture._poolSize] : new SubmitTexture(SubmitBase.TYPE_TEXTURE);
        o._mesh = mesh;
        o._key.clear();
        o._key.submitType = SubmitBase.KEY_DRAWTEXTURE;
        o._ref = 1;
        o._startIdx = mesh.indexNum * CONST3D2D.BYTES_PIDX;
        o._numEle = 0;
        var blendType = context._nBlendType;
        o._key.blendShader = blendType;
        o._blendFn = context._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
        o.shaderValue = sv;
        //sv.setValue(context._shader2D);
        if (context._colorFiler) {
            var ft = context._colorFiler;
            sv.defines.add(ft.type);
            sv.colorMat = ft._mat;
            sv.colorAlpha = ft._alpha;
        }
        return o;
    }
}
SubmitTexture._poolSize = 0;
SubmitTexture.POOL = [];
