import { RenderTexture } from "../../../resource/RenderTexture";
import { SingletonList } from "../../../utils/SingletonList";
import { Camera } from "../../core/Camera";
import { DirectionLightCom } from "../../core/light/DirectionLightCom";
import { ShadowCascadesMode } from "../../core/light/ShadowCascadesMode";
import { IRenderContext3D } from "../IRenderContext3D";
import { IBaseRenderNode } from "../Render3DNode/IBaseRenderNode";

export interface IDirectLightShadowRP {
    light: DirectionLightCom;
    shadowCastMode: ShadowCascadesMode;
    camera: Camera;
    destTarget: RenderTexture;
    update(context: IRenderContext3D): void;
    render(context: IRenderContext3D, list: SingletonList<IBaseRenderNode>): void;
}