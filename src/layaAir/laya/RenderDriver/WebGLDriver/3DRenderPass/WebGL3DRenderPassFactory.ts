import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { ISpotLightShadowRP, IRenderContext3D, IRenderElement3D, ISkyRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebGLDirectLightShadowRP } from "./WebGLDirectLightShadowRP";
import { WebGLForwardAddClusterRP } from "./WebGLForwardAddClusterRP";
import { WebGLForwardAddRP } from "./WebGLForwardAddRP";
import { WebGLRender3DProcess } from "./WebGLRender3DProcess";
import { WebGLBlitQuadCMDData, WebGLDrawElementCMDData, WebGLDrawNodeCMDData, WebGLSetRenderData, WebGLSetRenderTargetCMD, WebGLSetShaderDefine, WebGLSetViewportCMD } from "./WebGLRenderCMD/WebGLRenderCMD";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";
import { WebGLSkinRenderElement3D } from "./WebGLSkinRenderElement3D";
import { WebGLSkyRenderElement3D } from "./WebGLSkyRenderElement3D";
import { WebGLSpotLightShadowRP } from "./WebGLSpotLightShadowRP";


export class WebGL3DRenderPassFactory implements I3DRenderPassFactory {
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new WebGLSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new WebGLSetShaderDefine();
    }
    createDrawNodeCMDData(): DrawNodeCMDData {
        return new WebGLDrawNodeCMDData();
    }
    createBlitQuadCMDData(): BlitQuadCMDData {
        return new WebGLBlitQuadCMDData();
    }
    createDrawElementCMDData(): DrawElementCMDData {
        return new WebGLDrawElementCMDData();
    }
    createSetViewportCMD(): SetViewportCMD {
        return new WebGLSetViewportCMD();
    }
    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new WebGLSetRenderTargetCMD();
    }
    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }

    createSkinRenderElement(): IRenderElement3D {
        return new WebGLSkinRenderElement3D();
    }
    createRenderContext3D(): IRenderContext3D {
        return new WebGLRenderContext3D();
    }
    createRenderElement3D(): IRenderElement3D {
        return new WebGLRenderElement3D();
    }

    createSkyRenderElement(): ISkyRenderElement3D {
        return new WebGLSkyRenderElement3D();
    }

    createDirectLightShadowRP(): WebGLDirectLightShadowRP {
        return new WebGLDirectLightShadowRP();
    }
    createSpotLightShadowRP(): ISpotLightShadowRP {
        return new WebGLSpotLightShadowRP();
    }
    createForwardAddRP(): WebGLForwardAddRP {
        return new WebGLForwardAddRP();
    }
    createForwardAddCluster(): WebGLForwardAddClusterRP {
        return new WebGLForwardAddClusterRP();
    }
    createRender3DProcess(): WebGLRender3DProcess {
        return new WebGLRender3DProcess();
    }
}