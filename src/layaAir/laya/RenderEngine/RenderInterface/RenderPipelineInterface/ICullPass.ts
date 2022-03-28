import { SingletonList } from "../../../d3/component/SingletonList";
import { BaseRender } from "../../../d3/core/render/BaseRender";
import { CameraCullInfo, ShadowCullInfo } from "../../../d3/graphics/FrustumCulling";
import { IBaseRenderOBJ } from "./IBaseRender";
import { ISceneRenderManager } from "./ISceneRenderManager";

/**
 * 裁剪接口
 */
export interface ICullPass{
    cullSceneByCameraCullInfo(cameraCullInfo:CameraCullInfo,renderManager:ISceneRenderManager):SingletonList<IBaseRenderOBJ>;
    cullRenderByShadowCullInfo( cullInfo: ShadowCullInfo,renderManager:ISceneRenderManager):SingletonList<IBaseRenderOBJ>;
}