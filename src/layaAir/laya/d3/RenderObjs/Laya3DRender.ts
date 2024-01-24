import { I3DRenderPassFactory } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { I3DRenderModuleFactory } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleFactory";
import { IRenderEngine3DOBJFactory } from "../RenderDriverLayer/IRenderEngine3DOBJFactory";

export class Laya3DRender {
    static Render3DModuleDataFactory: I3DRenderModuleFactory;
    static Render3DPassFactory:I3DRenderPassFactory;
    static renderOBJCreate:IRenderEngine3DOBJFactory;
}