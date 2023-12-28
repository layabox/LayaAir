import { RenderTexture } from "../../../resource/RenderTexture";
import { SingletonList } from "../../../utils/SingletonList";
import { SpotLightCom } from "../../core/light/SpotLightCom";
import { IRenderContext3D } from "../IRenderContext3D";
import { IBaseRenderNode } from "../Render3DNode/IBaseRenderNode";

export interface ISpotLightShadowRP {
    light: SpotLightCom;
    destTarget: RenderTexture;
}