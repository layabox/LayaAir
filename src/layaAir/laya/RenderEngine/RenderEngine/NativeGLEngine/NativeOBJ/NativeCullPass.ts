import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { RenderContext3D } from "../../../../d3/core/render/RenderContext3D";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { FrustumCulling } from "../../../../d3/graphics/FrustumCulling";
import { Stat } from "../../../../utils/Stat";
import { ICameraCullInfo } from "../../../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../../../RenderInterface/RenderPipelineInterface/ICullPass";
import { IShadowCullInfo } from "../../../RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { NativeSceneRenderManager } from "./NativeSceneRenderManager";


export class NativeCullPassBase implements ICullPass {

    private _nativeObj: any;
    private _tempRenderList:SingletonList<BaseRender>;
    get cullList(): SingletonList<BaseRender> {
        this._tempRenderList.elements = this._nativeObj.cullList;
        this._tempRenderList.length = this._nativeObj.cullList.length;
        return this._tempRenderList;
    }

    constructor() {
        this._nativeObj = new (window as any).conchCullPass();
        this._tempRenderList = new SingletonList<BaseRender>();
    }

    cullByCameraCullInfo(cameraCullInfo: ICameraCullInfo, renderManager: NativeSceneRenderManager): void {
        //native Cull
        this._nativeObj.cullByCameraCullInfo((cameraCullInfo as any)._nativeObj, (renderManager as any)._nativeObj);
        //Custom list Cull
        var customRenderList = renderManager._customCullList;
        var boundFrustum = cameraCullInfo.boundFrustum;
        var cullMask: number = cameraCullInfo.cullingMask;
        var renders = customRenderList.elements;
        let context = RenderContext3D._instance;
        for (var i: number = 0, n: number = customRenderList.length; i < n; i++) {
            var render: BaseRender = <BaseRender>renders[i];
            var canPass: boolean;
            canPass = ((Math.pow(2, (render.owner as Sprite3D)._layer) & cullMask) != 0) && render._enabled;
            if (canPass) {debugger
                Stat.frustumCulling++;
                if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum, context)) {
                    this._nativeObj.cullList.push(render);
                }
            }
        }
    }
    cullByShadowCullInfo(cullInfo: IShadowCullInfo, renderManager: NativeSceneRenderManager): void {
        //native Cull
        //TODO transparent filter
        this._nativeObj.cullByShadowCullInfo(cullInfo, renderManager);
        //Custom list Cull
        var customRenderList = renderManager._customCullList;
        var renders = customRenderList.elements;
        for (var i: number = 0, n: number = customRenderList.length; i < n; i++) {
            var render: BaseRender = <BaseRender>renders[i];
            var canPass: boolean = render.castShadow && render._enabled && render.sharedMaterial.depthWrite;
            if (canPass) {debugger
                Stat.frustumCulling++;
                let pass = FrustumCulling.cullingRenderBounds(render.bounds, cullInfo);
                pass && this._nativeObj.cullList.push(render);
            }
        }
    }
    cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: NativeSceneRenderManager): void {
        //native Cull
        //TODO transparent filter
        this._nativeObj.cullingSpotShadow(cameraCullInfo, renderManager);
        
        //Custom list Cull
        var customRenderList = renderManager._customCullList;
        var renders = customRenderList.elements;
        let context = RenderContext3D._instance;
        for (var i: number = 0, n: number = customRenderList.length; i < n; i++) {
            Stat.frustumCulling++;
            var render: BaseRender = <BaseRender>renders[i];
            var canPass: boolean = render.castShadow && render._enabled && render.sharedMaterial.depthWrite;
            if (canPass) {debugger
                var render: BaseRender = <BaseRender>renders[i];
                if (canPass && render._needRender(cameraCullInfo.boundFrustum, context))
                    this._nativeObj.cullList.push(render);
            }
        }
    }

}