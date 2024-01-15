import { InternalRenderTarget } from "../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { SpotLightCom } from "../../core/light/SpotLightCom";

export interface ISpotLightShadowRP {
    light: SpotLightCom;
    destTarget: InternalRenderTarget;
}