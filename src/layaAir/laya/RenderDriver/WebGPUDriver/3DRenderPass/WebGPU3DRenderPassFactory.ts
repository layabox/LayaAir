import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkyRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

export class WebGPU3DRenderPassFactory implements I3DRenderPassFactory{
    createRender3DProcess(): IRender3DProcess {
        throw new Error("Method not implemented.");
    }
    createRenderContext3D(): IRenderContext3D {
      return new WebGPURenderContext3D();
    }
    createRenderElement3D(): IRenderElement3D {
        return new WebGPURenderElement3D();
    }
    createSkinRenderElement(): IRenderElement3D {
        return null;//TODO
    }
    createSkyRenderElement(): ISkyRenderElement3D {
        return null;//TODO
    }
    createSceneRenderManager(): ISceneRenderManager {
       return new SceneRenderManagerOBJ();
    }
    createDrawNodeCMDData(): DrawNodeCMDData {
       return null;//TODO
    }
    createBlitQuadCMDData(): BlitQuadCMDData {
       return null;//TODO
    }
    createDrawElementCMDData(): DrawElementCMDData {
       return null;//TODO
    }
    createSetViewportCMD(): SetViewportCMD {
       return null;//TODO
    }
    createSetRenderTargetCMD(): SetRenderTargetCMD {
       return null;//TODO
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
       return null;//TODO
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
       return null;//TODO
    }
    
}