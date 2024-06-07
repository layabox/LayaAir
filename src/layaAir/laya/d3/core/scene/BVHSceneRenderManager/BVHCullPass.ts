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

/**
 * 类实现BVH架构的裁剪Pass
 */
export class BVHCullPass extends CullPassBase {
    protected _cullList: SingletonList<BaseRender> = new SingletonList();
    /**
     * 获得裁剪队列
     */
    get cullList(): SingletonList<BaseRender> {
        return this._cullList;
    }

    /**
     * 基于相机视锥裁剪
     * @param cameraCullInfo 
     * @param renderManager 
     */
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
            canPass = ((1 << render.renderNode.layer) & cullMask) != 0 && render._enabled && (render.renderbitFlag == 0);
            canPass = canPass && ((render.renderNode.staticMask & staticMask) != 0);
            if (canPass) {
                Stat.frustumCulling++;
                if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum, context)) {
                    this.cullList.add(render);
                }
            }
        }
    }

    /**
     * 基于阴影视锥裁剪
     * @param cullInfo 
     * @param renderManager 
     */
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

    /**
     * 基于Spot视锥的裁剪
     * @param cameraCullInfo 
     * @param renderManager 
     */
    cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {
        //TODO
    }
} 