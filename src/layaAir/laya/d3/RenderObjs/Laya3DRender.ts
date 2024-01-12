import { I3DRenderDriverPassFactory } from "../RenderDriverLayer/I3DRenderDriverPassFactory";
import { IRenderEngine3DOBJFactory } from "../RenderDriverLayer/IRenderEngine3DOBJFactory";

export class Laya3DRender {
    static renderOBJCreate: IRenderEngine3DOBJFactory;
    static renderDriverPassCreate:I3DRenderDriverPassFactory;
}