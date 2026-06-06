import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { NotImplementedError } from "../../../utils/Error";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { IBatchModuleAgent } from "../../DriverDesign/3DRenderPass/IBatchModuleAgent";
import { ComputeCommandAppatchCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebRender3DProcess } from "../../RenderModuleData/WebModuleData/3D/WebForwardAddRP/WebRender3DProcess";
import { WebForwardAddClusterRP } from "../../RenderModuleData/WebModuleData/3D/WebForwardAddRP/WebForwardAddClusterRP";
import { WebForwardAddRP } from "../../RenderModuleData/WebModuleData/3D/WebForwardAddRP/WebForwardAddRP";
import { WebSceneRenderManager } from "../../RenderModuleData/WebModuleData/3D/WebScene3DRenderManager";
import { WebBaseSpotRP } from "../../RenderModuleData/WebModuleData/3D/WebShadowRP/WebBaseSpotRP";
import { WebDirCascadeShadowRP } from "../../RenderModuleData/WebModuleData/3D/WebShadowRP/WebDirCascadeShadowRP";
import { WebGLSetRenderData, WebGLSetShaderDefine } from "../RenderDevice/WebGLRenderCMD";
import { WebGLMeshRenderBatchAgent } from "./BatchModule/WebGLMeshRenderBatchAgent";
import { WebGLBlitQuadCMDData, WebGLDrawElementCMDData, WebGLDrawNodeCMDData, WebGLSetRenderTargetCMD, WebGLSetViewportCMD } from "./WebGLRenderCMD/WebGL3DRenderCMD";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";
import { WebGLSkinRenderElement3D } from "./WebGLSkinRenderElement3D";
import { BlitQuadCMDData, DrawElementCMDData, DrawNodeCMDData, SetRenderTargetCMD, SetViewportCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
WebBaseRenderNode.BaseRenderNodeClass = WebBaseRenderNode;
export class WebGL3DRenderPassFactory implements I3DRenderPassFactory {
    createMeshRenderBatchModule(): IBatchModuleAgent {
        return new WebGLMeshRenderBatchAgent();
    }

    createSimpleSkinRenderBatchModule(): IBatchModuleAgent {
        return new WebGLMeshRenderBatchAgent();
    }

    // createComputeCommandAppatchCMD?(): ComputeCommandAppatchCMD {
    //     throw new NotImplementedError();
    // }

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
        return new WebSceneRenderManager();
    }

    createSkinRenderElement(): ISkinRenderElement3D {
        return new WebGLSkinRenderElement3D();
    }

    createRenderContext3D(): IRenderContext3D {
        let context = new WebGLRenderContext3D();
        return context;
    }

    createRenderElement3D(): IRenderElement3D {
        return new WebGLRenderElement3D();
    }


    createRender3DProcess(): IRender3DProcess {
        let renderPass = new WebRender3DProcess();
        let forwardRP = renderPass._renderPass = new WebForwardAddRP();
        forwardRP.mainRenderpass = new WebForwardAddClusterRP();
        forwardRP.dirShadowRenderPass = new WebDirCascadeShadowRP();
        forwardRP.spotShadowRenderPass = new WebBaseSpotRP();
        return renderPass;
    }
}


Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
});