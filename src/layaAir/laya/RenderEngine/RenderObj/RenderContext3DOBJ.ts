import { Camera } from "../../d3/core/Camera";
import { Vector4 } from "../../d3/math/Vector4";
import { Viewport } from "../../d3/math/Viewport";
import { LayaGL } from "../../layagl/LayaGL";
import { IRenderTarget } from "../RenderInterface/IRenderTarget";
import { IRenderContext3D } from "../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { ShaderData } from "../RenderShader/ShaderData";

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
    pipelineMode: string;
    //Camera Shader Data
    cameraShaderData: ShaderData;
    //Scene cache
    sceneID: number;
    //scene Shader Data
    sceneShaderData: ShaderData;
    //Camera Update Mark
    cameraUpdateMark: number;

    constructor() {
        this.viewPort = new Viewport(0, 0, 0, 0);
        this.scissor = new Vector4();
    }

    /**设置IRenderContext */
    applyContext(): void {
        this.destTarget._start();
        this.cameraUpdateMark = Camera._updateMark;
        LayaGL.renderEngine.viewport(this.viewPort.x, this.viewPort.y, this.viewPort.width, this.viewPort.height);
        LayaGL.renderEngine.scissor(this.scissor.x, this.scissor.y, this.scissor.z, this.scissor.w);
    }
}