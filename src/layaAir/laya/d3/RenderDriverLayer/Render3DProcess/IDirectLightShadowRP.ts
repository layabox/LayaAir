import { InternalRenderTarget } from "../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { IDirectLightData } from "../RenderModuleData/IDirectLightData";
import { ICameraNodeData } from "../RenderModuleData/IModuleData";

export interface IDirectLightShadowRP {
    light: IDirectLightData;
    camera: ICameraNodeData;
    destTarget: InternalRenderTarget;
}