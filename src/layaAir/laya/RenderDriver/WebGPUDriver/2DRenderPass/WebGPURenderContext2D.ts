import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPURenderelement2D } from "./WebGPURenderElement2D";

export class WebGPURenderContext2D implements IRenderContext2D {
    private _clearColor: Color = new Color(0, 0, 0, 0);
    _destRT: InternalRenderTarget;
    invertY: boolean = false;
    pipelineMode: string = "Forward";
    sceneData: WebGPUShaderData;
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
    }

    drawRenderElementOne(node: WebGPURenderelement2D): void {
        node._prepare(this);
        node._render(this);
    }
}