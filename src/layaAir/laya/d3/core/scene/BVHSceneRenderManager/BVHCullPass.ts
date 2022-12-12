import { ICameraCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICullPass";
import { ISceneRenderManager } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../render/BaseRender";


export class BVHCullPass implements ICullPass {
    private _cullList: SingletonList<BaseRender> = new SingletonList();

    get cullList(): SingletonList<BaseRender> {
        return this._cullList;
    }

    cullByCameraCullInfo(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {

    }
    
    cullByShadowCullInfo(cullInfo: IShadowCullInfo, renderManager: ISceneRenderManager): void {

    }
    
    cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {

    }
} 