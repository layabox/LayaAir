import { RenderElement } from "../../d3/core/render/RenderElement";
import { Vector4 } from "../../d3/math/Vector4";
import { Viewport } from "../../d3/math/Viewport";
import { LayaGL } from "../../layagl/LayaGL";
import { IRenderTarget } from "../RenderInterface/IRenderTarget";
import { IRenderContext3D, PipelineMode } from "../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { ShaderData } from "../RenderShader/ShaderData";
import { RenderElementOBJ } from "./RenderElementOBJ";

export class RenderContext3DOBJ implements IRenderContext3D {

    //dest Texture
    destTarget: IRenderTarget;
    //viewPort
    viewPort: Viewport;
    //scissor
    scissor: Vector4;
    //is invert Y
    invertY: boolean = false;
    //pipeLineMode
    pipelineMode: PipelineMode;
    //Camera Shader Data
    cameraShaderData: ShaderData;
    //Scene cache
    sceneID: number;
    //scene Shader Data
    sceneShaderData: ShaderData;
    //Camera Update Mark
    cameraUpdateMark: number;
    //Global ShaderData
    globalShaderData: ShaderData;

    constructor() {
        this.viewPort = new Viewport(0, 0, 0, 0);
        this.scissor = new Vector4();
    }

    /**设置IRenderContext */
    applyContext(cameraUpdateMark: number): void {
        this.destTarget && this.destTarget._start();
        this.cameraUpdateMark = cameraUpdateMark;
        LayaGL.renderEngine.viewport(this.viewPort.x, this.viewPort.y, this.viewPort.width, this.viewPort.height);
        LayaGL.renderEngine.scissor(this.scissor.x, this.scissor.y, this.scissor.z, this.scissor.w);
    }

    drawRenderElement(renderelemt: RenderElementOBJ): void {
        renderelemt._render(this);
    }
}