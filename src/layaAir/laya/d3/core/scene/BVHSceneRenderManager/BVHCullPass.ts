import { ICameraCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ISceneRenderManager } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { SingletonList } from "../../../../utils/SingletonList";
import { Stat } from "../../../../utils/Stat";
import { FrustumCulling } from "../../../graphics/FrustumCulling";
import { BoundFrustum } from "../../../math/BoundFrustum";
import { CullPassBase } from "../../../RenderObjs/RenderObj/CullPass";
import { BaseRender } from "../../render/BaseRender";
import { RenderContext3D } from "../../render/RenderContext3D";
import { BVHSceneRenderManager } from "./BVHSceneRenderManager";


export class BVHCullPass extends CullPassBase {
    protected _cullList: SingletonList<BaseRender> = new SingletonList();
    //protected _cullPass:
    get cullList(): SingletonList<BaseRender> {
        return this._cullList;
    }

    cullByCameraCullInfo(cameraCullInfo: ICameraCullInfo, renderManager: BVHSceneRenderManager): void {
        this._cullList.length = 0;
        //BVH
        renderManager.bvhSpatial.getItemByCameraCullInfo(cameraCullInfo,this._cullList);
        //Dynamic
        var renderList = renderManager.otherList;
        var renders = renderList.elements;
        var boundFrustum: BoundFrustum = cameraCullInfo.boundFrustum;
        var cullMask: number = cameraCullInfo.cullingMask;
        let staticMask = cameraCullInfo.staticMask;
        let context = RenderContext3D._instance;
        for (var i: number = 0, n: number = renderList.length; i < n; i++) {
            var render = renders[i];
            var canPass: boolean;
            canPass = (Math.pow(2, render.renderNode.layer) & cullMask) != 0 && render._enabled && (render.renderbitFlag == 0);
            canPass = canPass && ((render.renderNode.staticMask & staticMask) != 0);
            if (canPass) {
                Stat.frustumCulling++;
                if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum, context)) {
                    this.cullList.add(render);
                }
            }
        }
    }

    cullByShadowCullInfo(cullInfo: IShadowCullInfo, renderManager: BVHSceneRenderManager): void {
        this._cullList.length = 0;
        //BVH
        renderManager.bvhSpatial.getItemBySCI(cullInfo,this._cullList);
        //Dynamic
        var renderList = renderManager.otherList;
        var renders = renderList.elements;
        for (var i: number = 0, n: number = renderList.length; i < n; i++) {
            var render = renders[i];
            var canPass: boolean = render.castShadow && render._enabled && (render.renderbitFlag == 0);
            if (canPass) {
                Stat.frustumCulling++;
                let pass = FrustumCulling.cullingRenderBounds(render.bounds, cullInfo);
                pass && this._cullList.add(render);
            }
        }
    }

    cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {
        //TODO
    }
} 