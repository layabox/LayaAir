import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebGPU3DRenderPass } from "./WebGPU3DRenderPass";
import { WebGPUBlitQuadCMDData } from "./WebGPURenderCMD/WebGPUBlitQuadCMDData";
import { WebGPUDrawNodeCMDData } from "./WebGPURenderCMD/WebGPUDrawNodeCMDData";
import { WebGPUSetRenderData } from "./WebGPURenderCMD/WebGPUSetRenderData";
import { WebGPUSetRenderTargetCMD } from "./WebGPURenderCMD/WebGPUSetRenderTargetCMD";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";
import { WebGPUSkinRenderElement3D } from "./WebGPUSkinRenderElement3D";

/**
 * WebGPU渲染工厂类
 */
export class WebGPU3DRenderPassFactory implements I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess {
        return new WebGPU3DRenderPass();
    }
    createRenderContext3D(): IRenderContext3D {
        return new WebGPURenderContext3D();
    }
    createRenderElement3D(): IRenderElement3D {
        return new WebGPURenderElement3D();
    }
    createSkinRenderElement(): ISkinRenderElement3D {
        return new WebGPUSkinRenderElement3D();
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }
    createDrawNodeCMDData(): DrawNodeCMDData {
        return new WebGPUDrawNodeCMDData();
    }
    createBlitQuadCMDData(): BlitQuadCMDData {
        return new WebGPUBlitQuadCMDData();
    }
    createDrawElementCMDData(): DrawElementCMDData {
        return null;//TODO
    }
    createSetViewportCMD(): SetViewportCMD {
        return null;//TODO
    }
    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new WebGPUSetRenderTargetCMD();
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new WebGPUSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return null;//TODO
    }
}