import { SingletonList } from "../../../d3/component/SingletonList";
import { BaseRender } from "../../../d3/core/render/BaseRender";
import { CameraCullInfo, ShadowCullInfo } from "../../../d3/graphics/FrustumCulling";
import { ISceneRenderManager } from "./ISceneRenderManager";

/**
 * 裁剪接口
 */
export interface ICullPass{
    cullList:SingletonList<BaseRender>;
    cullByCameraCullInfo(cameraCullInfo: CameraCullInfo, renderManager: ISceneRenderManager):void;
    cullByShadowCullInfo(cullInfo: ShadowCullInfo, renderManager: ISceneRenderManager): void ;
    cullingSpotShadow(cameraCullInfo: CameraCullInfo, renderManager: ISceneRenderManager): void;
}