import { SingletonList } from "../../../../d3/component/SingletonList";
import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { ICameraCullInfo } from "../../../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../../../RenderInterface/RenderPipelineInterface/ICullPass";
import { ISceneRenderManager } from "../../../RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../../../RenderInterface/RenderPipelineInterface/IShadowCullInfo";


export class NativeCullPassBase implements ICullPass {
    
    private _nativeObj: any;

    get cullList():SingletonList<BaseRender>{
        return this._nativeObj.cullList;
    }

    constructor(){
        this._nativeObj = new (window as any).conchCullPass();
    }

    cullByCameraCullInfo(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {
        this._nativeObj.cullByCameraCullInfo(cameraCullInfo, renderManager);
    }
    cullByShadowCullInfo(cullInfo: IShadowCullInfo, renderManager: ISceneRenderManager): void {
        this._nativeObj.cullByShadowCullInfo(cullInfo, renderManager);
    }
    cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void{
        this._nativeObj.cullingSpotShadow(cameraCullInfo, renderManager);
    }
    
}