import { I3DRenderPassFactory } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { IRenderEngine3DOBJFactory } from "../../RenderDriver/DriverDesign/3DRenderPass/IRenderEngine3DOBJFactory";
import { I3DRenderModuleFactory } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleFactory";

export class Laya3DRender {
    static Render3DPassFactory: I3DRenderPassFactory;
    static Render3DModuleDataFactory: I3DRenderModuleFactory;

    /**
     * @deprecated
     */
    static renderOBJCreate: IRenderEngine3DOBJFactory;
}