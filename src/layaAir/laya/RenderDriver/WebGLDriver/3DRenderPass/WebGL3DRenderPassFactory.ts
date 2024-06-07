import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { IInstanceRenderElement3D } from "../../DriverCommon/IInstanceRenderElement3D";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { WebGLInstanceRenderElement3D } from "./WebGLInstanceRenderElement3D";
import { WebGLRender3DProcess } from "./WebGLRender3DProcess";
import { WebGLBlitQuadCMDData, WebGLDrawElementCMDData, WebGLDrawNodeCMDData, WebGLSetRenderData, WebGLSetRenderTargetCMD, WebGLSetShaderDefine, WebGLSetViewportCMD } from "./WebGLRenderCMD/WebGLRenderCMD";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";
import { WebGLSkinRenderElement3D } from "./WebGLSkinRenderElement3D";

export class WebGL3DRenderPassFactory implements I3DRenderPassFactory {
    private _pool_instanceRenderElement3D: IInstanceRenderElement3D[] = [];
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
        return new WebGLRenderContext3D();
    }
    createRenderElement3D(): WebGLRenderElement3D {
        return new WebGLRenderElement3D();
    }
    getMaxInstanceCount(): number {
        return 1024;
    }
    recoverInstanceRenderElement3D(element: IInstanceRenderElement3D): void {
        this._pool_instanceRenderElement3D.push(element);
    }
    createInstanceRenderElement3D(): IInstanceRenderElement3D {
        return this._pool_instanceRenderElement3D.pop() ?? new WebGLInstanceRenderElement3D();
    }
    createRender3DProcess(): WebGLRender3DProcess {
        return new WebGLRender3DProcess();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
});