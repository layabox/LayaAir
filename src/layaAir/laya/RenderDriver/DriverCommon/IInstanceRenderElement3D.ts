import { SingletonList } from "../../utils/SingletonList";
import { IRenderElement3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderGeometryElement } from "../DriverDesign/RenderDevice/IRenderGeometryElement";

export interface IInstanceRenderElement3D extends IRenderElement3D {
    _instanceElementList: SingletonList<IRenderElement3D>;

    setGeometry(geometry: IRenderGeometryElement): void;
    clearRenderData(): void;
    recover(): void;
}