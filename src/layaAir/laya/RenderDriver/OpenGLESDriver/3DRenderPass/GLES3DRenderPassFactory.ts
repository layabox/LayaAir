import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { GLESDirectLightShadowRP } from "./GLESDirectLightShadowRP";
import { GLESForwardAddClusterRP } from "./GLESForwardAddClusterRP";
import { GLESForwardAddRP } from "./GLESForwardAddRP";
import { GLESRenderElement3D } from "./GLESRenderElement3D";
import { GLESSkinRenderElement3D } from "./GLESSkinRenderElement3D";
import { GLESSpotLightShadowRP } from "./GLESSpotLightShadowRP";

export class GLES3DRenderPassFactory implements I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess {
        throw new Error("Method not implemented.");
    }
    createRenderContext3D(): IRenderContext3D {
        throw new Error("Method not implemented.");
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        throw new Error("Method not implemented.");
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        throw new Error("Method not implemented.");
    }
    createDrawNodeCMDData(): DrawNodeCMDData {
        throw new Error("Method not implemented.");
    }
    createBlitQuadCMDData(): BlitQuadCMDData {
        throw new Error("Method not implemented.");
    }
    createDrawElementCMDData(): DrawElementCMDData {
        throw new Error("Method not implemented.");
    }
    createSetViewportCMD(): SetViewportCMD {
        throw new Error("Method not implemented.");
    }
    createSetRenderTargetCMD(): SetRenderTargetCMD {
        throw new Error("Method not implemented.");
    }
    createSetRenderData() {
        throw new Error("Method not implemented.");
    }
    createRenderCMDDriver() {
        throw new Error("Method not implemented.");
    }
    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }
    createSkinRenderElement(): IRenderElement3D {
        return new GLESSkinRenderElement3D();
    }

    createDirectLightShadowRP(): GLESDirectLightShadowRP {
        return new GLESDirectLightShadowRP();
    }

    createSpotLightShadowRP(): GLESSpotLightShadowRP {
        return new GLESSpotLightShadowRP();
    }

    createForwardAddRP(): GLESForwardAddRP {
        return new GLESForwardAddRP();
    }

    createForwardAddCluster(): GLESForwardAddClusterRP {
        return new GLESForwardAddClusterRP();
    }


    createRenderElement3D(): GLESRenderElement3D {
        return new GLESRenderElement3D();
    }
}