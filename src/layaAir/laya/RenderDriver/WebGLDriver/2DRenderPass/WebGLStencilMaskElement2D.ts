import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector3 } from "../../../maths/Vector3";
import { Color } from "../../../maths/Color";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { Shader2D } from "../../../webgl/shader/d2/Shader2D";
import { IClipInfo } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebRenderStruct2D } from "../../RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLRenderElement2D } from "./WebGLRenderElement2D";

export class WebGLStencilMaskElement2D extends WebGLRenderElement2D {

    private _nMatrix0: Vector3 = new Vector3();
    private _nMatrix1: Vector3 = new Vector3();
    private _stencilRef: number = -1;
    private _stencilReadMask: number = -1;
    private _stencilWriteMask: number = -1;
    private _stencilTest: number = -1;
    private _stencilOpZPass: number = -1;
    private _clipInfo: IClipInfo = null;
    private _clipUpdateFrame: number = -1;

    static create(): WebGLStencilMaskElement2D {
        const element = new WebGLStencilMaskElement2D();
        element.geometry = ShaderDefines2D._stencilGeo as WebGLRenderGeometryElement;
        element.subShader = Shader2D.stencilShader.getSubShaderAt(0);
        element.nodeCommonMap = ["BaseRender2D"];
        element.renderStateIsBySprite = true;
        element.noBatch = true;
        element.value2DShaderData = LayaGL.renderDeviceFactory.createShaderData(null) as WebGLShaderData;
        element.value2DShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        element.value2DShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, Color.WHITE);
        element.value2DShaderData.setInt(Shader3D.CULL, RenderState.CULL_NONE);
        element.value2DShaderData.setInt(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        element.value2DShaderData.setBool(Shader3D.DEPTH_WRITE, false);
        element.value2DShaderData.setInt(Shader3D.STENCIL_TEST, RenderState.STENCILTEST_EQUAL);
        element.value2DShaderData.setBool(Shader3D.STENCIL_WRITE, true);
        element.value2DShaderData.setInt(Shader3D.STENCIL_READ_MASK, 0xFF);
        element.value2DShaderData.setInt(Shader3D.STENCIL_WRITE_MASK, 0xFF);
        element.value2DShaderData.setVector3(Shader3D.STENCIL_Op, new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, RenderState.STENCILOP_INCR));
        return element;
    }

    setClip(owner: WebRenderStruct2D, clipInfo: IClipInfo, ref: number, opZPass: number): void {
        this.owner = owner;
        this._clipInfo = clipInfo;
        this._clipUpdateFrame = -1;
        this._updateClipUniforms();

        if (this._stencilRef !== ref) {
            this._stencilRef = ref;
            this.value2DShaderData.setInt(Shader3D.STENCIL_Ref, ref);
        }
        if (this._stencilTest !== RenderState.STENCILTEST_EQUAL) {
            this._stencilTest = RenderState.STENCILTEST_EQUAL;
            this.value2DShaderData.setInt(Shader3D.STENCIL_TEST, RenderState.STENCILTEST_EQUAL);
        }
        if (this._stencilReadMask !== 0xFF) {
            this._stencilReadMask = 0xFF;
            this.value2DShaderData.setInt(Shader3D.STENCIL_READ_MASK, 0xFF);
        }
        if (this._stencilWriteMask !== 0xFF) {
            this._stencilWriteMask = 0xFF;
            this.value2DShaderData.setInt(Shader3D.STENCIL_WRITE_MASK, 0xFF);
        }
        if (this._stencilOpZPass !== opZPass) {
            this._stencilOpZPass = opZPass;
            this.value2DShaderData.setVector3(Shader3D.STENCIL_Op, new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, opZPass));
        }
    }

    private _updateClipUniforms(): void {
        const clipInfo = this._clipInfo;
        if (!clipInfo || this._clipUpdateFrame === clipInfo._updateFrame)
            return;

        const dir = clipInfo.clipMatDir;
        const mat = clipInfo.clipMatrix;
        this._clipUpdateFrame = clipInfo._updateFrame;
        this._nMatrix0.setValue(dir.x, dir.z, mat.tx);
        this._nMatrix1.setValue(dir.y, dir.w, mat.ty);
        this.value2DShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix0);
        this.value2DShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix1);
    }

    override _prepare(context: any): void {
        this._updateClipUniforms();
        super._prepare(context);
    }

    override _render(context: any): void {
        this._updateClipUniforms();
        const engine = WebGLEngine.instance;
        engine.colorMask(false, false, false, false);
        super._render(context);
        engine.colorMask(true, true, true, true);
    }
}
