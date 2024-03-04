import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Viewport } from "../../../d3/math/Viewport";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";

export class WebGPURenderContext3D implements IRenderContext3D {
    globalShaderData: WebGPUShaderData;
    sceneData: WebGPUShaderData;
    sceneModuleData: WebSceneNodeData;
    cameraModuleData: WebCameraNodeData;
    cameraData: WebGPUShaderData;
    sceneUpdataMask: number;
    cameraUpdateMask: number;
    pipelineMode: string;
    invertY: boolean;
    _globalConfigShaderData: WebDefineDatas;
    
    _destRT:WebGPUInternalRT;
    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag): void {
        
    }
    setViewPort(value: Viewport): void {
        throw new Error("Method not implemented.");
    }
    setScissor(value: Vector4): void {
        throw new Error("Method not implemented.");
    }
    setClearData(clearFlag: number, clolor: Color, depth: number, stencil: number): number {
        throw new Error("Method not implemented.");
    }
    drawRenderElementList(list: SingletonList<IRenderElement3D>): number {
        throw new Error("Method not implemented.");
    }
    drawRenderElementOne(node: IRenderElement3D): number {
        throw new Error("Method not implemented.");
    }
    runOneCMD(cmd: IRenderCMD): void {
        throw new Error("Method not implemented.");
    }
    runCMDList(cmds: IRenderCMD[]): void {
        throw new Error("Method not implemented.");
    }

}