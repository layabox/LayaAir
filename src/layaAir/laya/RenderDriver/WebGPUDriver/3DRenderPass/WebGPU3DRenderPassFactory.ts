import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { IInstanceRenderElement3D } from "../../DriverCommon/IInstanceRenderElement3D";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebGPU3DRenderPass } from "./WebGPU3DRenderPass";
import { WebGPUInstanceRenderElement3D } from "./WebGPUInstanceRenderElement3D";
import { WebGPUBlitQuadCMDData } from "./WebGPURenderCMD/WebGPUBlitQuadCMDData";
import { WebGPUDrawElementCMDData } from "./WebGPURenderCMD/WebGPUDrawElementCMDData";
import { WebGPUDrawNodeCMDData } from "./WebGPURenderCMD/WebGPUDrawNodeCMDData";
import { WebGPUSetRenderData } from "./WebGPURenderCMD/WebGPUSetRenderData";
import { WebGPUSetRenderTargetCMD } from "./WebGPURenderCMD/WebGPUSetRenderTargetCMD";
import { WebGPUSetShaderDefine } from "./WebGPURenderCMD/WebGPUSetShaderDefine";
import { WebGPUSetViewportCMD } from "./WebGPURenderCMD/WebGPUSetViewportCMD";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";
import { WebGPUSkinRenderElement3D } from "./WebGPUSkinRenderElement3D";

/**
 * WebGPU渲染工厂类
 */
export class WebGPU3DRenderPassFactory implements I3DRenderPassFactory {
    private _pool_instanceRenderElement3D: IInstanceRenderElement3D[] = [];
    createRender3DProcess(): IRender3DProcess {
        return new WebGPU3DRenderPass();
    }
    createRenderContext3D(): IRenderContext3D {
        return new WebGPURenderContext3D();
    }
    createRenderElement3D(): IRenderElement3D {
        return new WebGPURenderElement3D();
    }
    getMaxInstanceCount(): number {
        return 1024;
    }
    recoverInstanceRenderElement3D(element: IInstanceRenderElement3D): void {
        this._pool_instanceRenderElement3D.push(element);
    }
    createInstanceRenderElement3D(): IInstanceRenderElement3D {
        return this._pool_instanceRenderElement3D.pop() ?? new WebGPUInstanceRenderElement3D();
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
        return new WebGPUDrawElementCMDData();
    }
    createSetViewportCMD(): SetViewportCMD {
        return new WebGPUSetViewportCMD();
    }
    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new WebGPUSetRenderTargetCMD();
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new WebGPUSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new WebGPUSetShaderDefine();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new WebGPU3DRenderPassFactory();
});