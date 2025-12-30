import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { NotImplementedError } from "../../../utils/Error";
import { IRender3DProcess, IRenderContext3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { IBatchModuleAgent } from "../../DriverDesign/3DRenderPass/IBatchModuleAgent";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { ComputeCommandAppatchCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { RTRender3DProcess } from "../../RenderModuleData/RuntimeModuleData/3D/3DRenderProcess/RTRender3DProcess";
import { RTScene3DRenderManager } from "../../RenderModuleData/RuntimeModuleData/3D/RTScene3DRenderManager";
import { GLESMeshRenderBatchAgent } from "../RenderDevice/BatchAgent/GLESMeshRenderBatchAgent";
import { GLESSetRenderData, GLESSetShaderDefine } from "../RenderDevice/GLESRenderCMD";
import { GLESBlitQuadCMDData, GLESDrawElementCMDData, GLESDrawNodeCMDData, GLESSetRenderTargetCMD, GLESSetViewportCMD } from "./GLESRenderCMD/GLES3DRenderCMD";
import { GLESRenderContext3D } from "./GLESRenderContext3D";
import { GLESRenderElement3D } from "./GLESRenderElement3D";
import { GLESSkinRenderElement3D } from "./GLESSkinRenderElement3D";

export class GLES3DRenderPassFactory implements I3DRenderPassFactory {
    createMeshRenderBatchModule(): IBatchModuleAgent {
        return new GLESMeshRenderBatchAgent();
    }
    createComputeCommandAppatchCMD?(): ComputeCommandAppatchCMD {
        throw new NotImplementedError;
    }

    createRender3DProcess(): IRender3DProcess {
        let renderpass = new RTRender3DProcess();
        return renderpass;

    }

    createRenderContext3D(): IRenderContext3D {
        return new GLESRenderContext3D();
    }

    createSetRenderDataCMD(): SetRenderDataCMD {
        return new GLESSetRenderData();
    }

    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new GLESSetShaderDefine();
    }

    createDrawNodeCMDData(): DrawNodeCMDData {
        return new GLESDrawNodeCMDData();
    }

    createBlitQuadCMDData(): BlitQuadCMDData {
        return new GLESBlitQuadCMDData();
    }

    createDrawElementCMDData(): DrawElementCMDData {
        return new GLESDrawElementCMDData();
    }

    createSetViewportCMD(): SetViewportCMD {
        return new GLESSetViewportCMD();
    }

    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new GLESSetRenderTargetCMD();
    }


    createSceneRenderManager(): ISceneRenderManager {
        return new RTScene3DRenderManager();
    }
    createSkinRenderElement(): GLESSkinRenderElement3D {
        return new GLESSkinRenderElement3D();
    }

    createRenderElement3D(): GLESRenderElement3D {
        return new GLESRenderElement3D();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new GLES3DRenderPassFactory();
})
