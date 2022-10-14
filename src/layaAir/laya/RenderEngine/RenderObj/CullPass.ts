import { SingletonList } from "../../utils/SingletonList"
import { BaseRender } from "../../d3/core/render/BaseRender";
import { RenderContext3D } from "../../d3/core/render/RenderContext3D";
import { FrustumCulling } from "../../d3/graphics/FrustumCulling";
import { BoundFrustum } from "../../d3/math/BoundFrustum";
import { Stat } from "../../utils/Stat";
import { ICameraCullInfo } from "../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../RenderInterface/RenderPipelineInterface/ICullPass";
import { ISceneRenderManager } from "../RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { Sprite3D } from "../../d3/core/Sprite3D";

export class CullPassBase implements ICullPass {
    private _cullList: SingletonList<BaseRender> = new SingletonList();

    get cullList(): SingletonList<BaseRender> {
        return this._cullList;
    }
    cullByCameraCullInfo(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {
        this._cullList.length = 0;
        var renders = renderManager.list.elements;
        var boundFrustum: BoundFrustum = cameraCullInfo.boundFrustum;
        var cullMask: number = cameraCullInfo.cullingMask;
        let staticMask = cameraCullInfo.staticMask;
        let context = RenderContext3D._instance;
        for (var i: number = 0, n: number = renderManager.list.length; i < n; i++) {
            var render = renders[i];
            var canPass: boolean;
            canPass = (Math.pow(2, render.renderNode.layer & cullMask) != 0) && render._enabled && (render.renderbitFlag == 0);
            canPass = canPass && (( render.renderNode.staticMask & staticMask) != 0);
            if (canPass) {
                Stat.frustumCulling++;
                if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum, context)) {
                    this.cullList.add(render);
                }
            }
        }
    }

    cullByShadowCullInfo(cullInfo: IShadowCullInfo, renderManager: ISceneRenderManager): void {
        this._cullList.length = 0;
        var renderList = renderManager.list;
        var renders = renderList.elements;
        for (var i: number = 0, n: number = renderList.length; i < n; i++) {
            var render = renders[i];
            var canPass: boolean = render.castShadow && render._enabled && (render.renderbitFlag == 0);
            if (canPass) {
                Stat.frustumCulling++;
                let pass = FrustumCulling.cullingRenderBounds(render.bounds, cullInfo);
                pass && this._cullList.add(render);
                // if (pass) {
                // 	render.distanceForSort = Vector3.distance(render.bounds.getCenter(), position);//TODO:合并计算浪费,或者合并后取平均值
                // 	var elements: RenderElement[] = render._renderElements;
                // 	for (var j: number = 0, m: number = elements.length; j < m; j++)
                // 		elements[j]._update(scene, context, null, null);
                // }
            }
        }
    }
    cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {
        this._cullList.length = 0;
        let renders = renderManager.list.elements;
        let boundFrustum: BoundFrustum = cameraCullInfo.boundFrustum;
        let context = RenderContext3D._instance;
        for (let i = 0, n = renderManager.list.length; i < n; i++) {
            let render = renders[i];
            let canPass: boolean = render.castShadow && render._enabled && (render.renderbitFlag == 0);
            if (canPass) {
                Stat.frustumCulling++;
                if (render._needRender(boundFrustum, context))
                    this._cullList.add(render);
            }
        }
    }

}