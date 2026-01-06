import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { CameraCullInfo, ShadowCullInfo } from "../../../../d3/shadowMap/ShadowSliceData";
import { IRenderContext3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { BatchCullMode, IBatchModuleAgent, IModuleAgentResource } from "../../../DriverDesign/3DRenderPass/IBatchModuleAgent";
import { RTBaseRenderNode } from "../../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";

export class GLESMeshRenderBatchAgent implements IBatchModuleAgent {

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESMeshRenderBatchAgent();
    }

    create(): void {
        this._nativeObj.create();
    }
    addRenderNode(object: BaseRender): boolean {
        return this._nativeObj.addRenderNode((object._baseRenderNode as RTBaseRenderNode)._nativeObj);
    }
    removeRenderNode(object: BaseRender): boolean {
        return this._nativeObj.removeRenderNode((object._baseRenderNode as RTBaseRenderNode)._nativeObj);
    }
    updateProperty(object: BaseRender, property: string | number): void {
        this._nativeObj.updateProperty((object._baseRenderNode as RTBaseRenderNode)._nativeObj, property);
    }

    release(): void {
        this._nativeObj.release();
    }

}