import { Laya } from "../../../../Laya";
import { LayaEnv } from "../../../../LayaEnv";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { SetRenderDataCMD, SetShaderDefineCMD, RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { RTScene3DRenderManager } from "../../RenderModuleData/RuntimeModuleData/3D/RTScene3DRenderManager";
import { LayaXRenderContext3D } from "./LayaXRenderContext3D";
import { LayaXRenderElement3D } from "./LayaXRenderElement3D";
import { LayaXRender3DProcess } from "./LayaXRender3DProcess";

/**
 * LayaX skin render element for 3D (Q20).
 * Extends LayaXRenderElement3D with skinned data support.
 */
class LayaXSkinRenderElement3D extends LayaXRenderElement3D implements ISkinRenderElement3D {
    _skinnedData: Float32Array[];

    get skinnedData(): Float32Array[] {
        return this._skinnedData;
    }
    set skinnedData(data: Float32Array[]) {
        this._skinnedData = data;
    }
}

/**
 * LayaX no-op SetRenderDataCMD.
 */
class LayaXSetRenderData extends SetRenderDataCMD {
    type: RenderCMDType = RenderCMDType.ChangeData;
    apply(_context: any): void {
        // No-op: Rust side handles data changes
    }
}

/**
 * LayaX no-op SetShaderDefineCMD.
 */
class LayaXSetShaderDefine extends SetShaderDefineCMD {
    type: RenderCMDType = RenderCMDType.ChangeShaderDefine;
    apply(_context: any): void {
        // No-op: Rust side handles shader define changes
    }
}

/**
 * LayaX no-op DrawNodeCMDData.
 */
class LayaXDrawNodeCMDData extends DrawNodeCMDData {
    type: RenderCMDType = RenderCMDType.DrawNode;
    apply(_context: IRenderContext3D): void {
        // No-op: Rust RenderFeature handles draw calls
    }
}

/**
 * LayaX no-op BlitQuadCMDData.
 */
class LayaXBlitQuadCMDData extends BlitQuadCMDData {
    type: RenderCMDType = RenderCMDType.Blit;
    apply(_context: IRenderContext3D): void {
        // No-op: Rust RenderFeature handles blit
    }
}

/**
 * LayaX no-op DrawElementCMDData.
 */
class LayaXDrawElementCMDData extends DrawElementCMDData {
    type: RenderCMDType = RenderCMDType.DrawElement;
    setRenderelements(_value: IRenderElement3D[]): void {
        // No-op
    }
    apply(_context: IRenderContext3D): void {
        // No-op: Rust RenderFeature handles draw calls
    }
}

/**
 * LayaX no-op SetViewportCMD.
 */
class LayaXSetViewportCMD extends SetViewportCMD {
    type: RenderCMDType = RenderCMDType.ChangeViewPort;
    apply(_context: IRenderContext3D): void {
        // No-op: Rust RenderFeature manages viewport
    }
}

/**
 * LayaX no-op SetRenderTargetCMD.
 */
class LayaXSetRenderTargetCMD extends SetRenderTargetCMD {
    type: RenderCMDType = RenderCMDType.ChangeRenderTarget;
    apply(_context: IRenderContext3D): void {
        // No-op: Rust RenderFeature manages render targets
    }
}

export class LayaX3DRenderPassFactory implements I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess {
        return new LayaXRender3DProcess();
    }

    createRenderContext3D(): IRenderContext3D {
        return new LayaXRenderContext3D();
    }

    createSetRenderDataCMD(): SetRenderDataCMD {
        return new LayaXSetRenderData();
    }

    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new LayaXSetShaderDefine();
    }

    createDrawNodeCMDData(): DrawNodeCMDData {
        return new LayaXDrawNodeCMDData();
    }

    createBlitQuadCMDData(): BlitQuadCMDData {
        return new LayaXBlitQuadCMDData();
    }

    createDrawElementCMDData(): DrawElementCMDData {
        return new LayaXDrawElementCMDData();
    }

    createSetViewportCMD(): SetViewportCMD {
        return new LayaXSetViewportCMD();
    }

    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new LayaXSetRenderTargetCMD();
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new RTScene3DRenderManager();
    }

    createSkinRenderElement(): ISkinRenderElement3D {
        return new LayaXSkinRenderElement3D();
    }

    createRenderElement3D(): IRenderElement3D {
        return new LayaXRenderElement3D();
    }
}

Laya.addBeforeInitCallback(() => {
    if (LayaEnv.isLayaX && !Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new LayaX3DRenderPassFactory();
})
