import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { Stat } from "../../../utils/Stat";
import { IInstanceRenderBatch } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { WebGLSetRenderData, WebGLSetShaderDefine } from "../RenderDevice/WebGLRenderCMD";
import { WebGLInstanceRenderBatch } from "./WebGLInstanceRenderBatch";
import { WebGLInstanceRenderElement3D } from "./WebGLInstanceRenderElement3D";
import { WebGLRender3DProcess } from "./WebGLRender3DProcess";
import { WebGLBlitQuadCMDData, WebGLDrawElementCMDData, WebGLDrawNodeCMDData, WebGLSetRenderTargetCMD, WebGLSetViewportCMD } from "./WebGLRenderCMD/WebGL3DRenderCMD";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";
import { WebGLSkinRenderElement3D } from "./WebGLSkinRenderElement3D";


export class WebGL3DRenderPassFactory implements I3DRenderPassFactory {
    createInstanceBatch(): IInstanceRenderBatch {
        return new WebGLInstanceRenderBatch();
    }
    createSetRenderDataCMD(): WebGLSetRenderData {
        return new WebGLSetRenderData();
    }
    createSetShaderDefineCMD(): WebGLSetShaderDefine {
        return new WebGLSetShaderDefine();
    }
    createDrawNodeCMDData(): WebGLDrawNodeCMDData {
        return new WebGLDrawNodeCMDData();
    }
    createBlitQuadCMDData(): WebGLBlitQuadCMDData {
        return new WebGLBlitQuadCMDData();
    }
    createDrawElementCMDData(): WebGLDrawElementCMDData {
        return new WebGLDrawElementCMDData();
    }
    createSetViewportCMD(): WebGLSetViewportCMD {
        return new WebGLSetViewportCMD();
    }
    createSetRenderTargetCMD(): WebGLSetRenderTargetCMD {
        return new WebGLSetRenderTargetCMD();
    }
    createSceneRenderManager(): SceneRenderManagerOBJ {
        return new SceneRenderManagerOBJ();
    }

    createSkinRenderElement(): WebGLSkinRenderElement3D {
        return new WebGLSkinRenderElement3D();
    }
    createRenderContext3D(): WebGLRenderContext3D {
        let context = new WebGLRenderContext3D();
        if (Stat.enableRenderPassStatArray) {
            context.drawRenderElementOne = context.drawRenderElementOne_StatUse;
            context.drawRenderElementList = context.drawRenderElementList_StatUse;
        }
        return context;
    }
    createRenderElement3D(): WebGLRenderElement3D {
        return new WebGLRenderElement3D();
    }

    createInstanceRenderElement3D(): WebGLInstanceRenderElement3D {
        return WebGLInstanceRenderElement3D.create();
    }

    createRender3DProcess(): WebGLRender3DProcess {
        return new WebGLRender3DProcess();
    }
}


Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
});