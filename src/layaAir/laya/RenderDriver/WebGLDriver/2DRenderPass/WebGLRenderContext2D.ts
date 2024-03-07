import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderelement2D } from "./WebGLRenderElement2D";

export class WebglRenderContext2D implements IRenderContext2D {
    private _clearColor: Color = new Color(0, 0, 0, 0);
    _destRT: InternalRenderTarget;
    invertY: boolean = false;
    pipelineMode: string = "Forward";
    sceneData: WebGLShaderData;
    _globalConfigShaderData: WebDefineDatas;

    private _offscreenWidth: number;
    private _offscreenHeight: number;

    constructor() {
        this._globalConfigShaderData = Shader3D._configDefineValues;
    }
    
    setOffscreenView(width: number, height: number): void {
        this._offscreenWidth = width;
        this._offscreenHeight = height;
    }

    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void {
        this._destRT = value;
        if (this._destRT) {
            WebGLEngine.instance.getTextureContext().bindRenderTarget(this._destRT);
            WebGLEngine.instance.viewport(0, 0, this._destRT._textures[0].width, this._destRT._textures[0].height);
        } else {
            WebGLEngine.instance.getTextureContext().bindoutScreenTarget();
            WebGLEngine.instance.viewport(0, 0, this._offscreenWidth, this._offscreenHeight);
        }
        WebGLEngine.instance.scissorTest(false);
        WebGLEngine.instance.clearRenderTexture(clear ? RenderClearFlag.Color : RenderClearFlag.Nothing, this._clearColor);
    }

    drawRenderElementOne(node: WebGLRenderelement2D): void {
        node._prepare(this);
        node._render(this);
    }

}