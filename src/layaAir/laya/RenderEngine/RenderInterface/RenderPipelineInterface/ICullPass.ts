import { SingletonList } from "../../../d3/component/SingletonList";
import { CameraCullInfo, ShadowCullInfo } from "../../../d3/graphics/FrustumCulling";
import { IBaseRenderNode } from "./IBaseRenderNode";
import { ISceneRenderManager } from "./ISceneRenderManager";

/**
 * 裁剪接口
 */
export interface ICullPass{
    cullByCameraCullInfo(cameraCullInfo:CameraCullInfo,renderManager:ISceneRenderManager):SingletonList<IBaseRenderNode>;
    cullByShadowCullInfo( cullInfo: ShadowCullInfo,renderManager:ISceneRenderManager):SingletonList<IBaseRenderNode>;
}