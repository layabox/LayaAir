import { SingletonList } from "../../../utils/SingletonList";
import { BaseRender } from "../../../d3/core/render/BaseRender";
import { ICameraCullInfo } from "./ICameraCullInfo";
import { ISceneRenderManager } from "./ISceneRenderManager";
import { IShadowCullInfo } from "./IShadowCullInfo";

/**
 * 裁剪接口
 */
export interface ICullPass{
    cullList:SingletonList<BaseRender>;
    cullByCameraCullInfo(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager):void;
    cullByShadowCullInfo(cullInfo: IShadowCullInfo, renderManager: ISceneRenderManager): void ;
    cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void;
}