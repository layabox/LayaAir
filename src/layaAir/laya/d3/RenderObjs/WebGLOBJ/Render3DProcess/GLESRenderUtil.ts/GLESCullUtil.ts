import { Vector3 } from "../../../../../maths/Vector3";
import { Stat } from "../../../../../utils/Stat";
import { FrustumCulling } from "../../../../graphics/FrustumCulling";
import { BoundFrustum } from "../../../../math/BoundFrustum";
import { CameraCullInfo } from "../../../RenderObj/CameraCullInfo";
import { GLESRenderContext3D } from "../../GLESRenderContext3D";
import { GLESBaseRenderNode } from "../../Render3DNode/GLESBaseRenderNode";
import { ShadowCullInfo } from "../GLESDirectLightShadowRP";
import { GLESRenderQueueList } from "./GLESRenderListQueue";

export class GLESCullUtil {
    static cullByCameraCullInfo(cameraCullInfo: CameraCullInfo, list: GLESBaseRenderNode[], count: number, opaqueList: GLESRenderQueueList, transparent: GLESRenderQueueList, context: GLESRenderContext3D) {
        var renders = list;
        var boundFrustum: BoundFrustum = cameraCullInfo.boundFrustum;
        var cullMask: number = cameraCullInfo.cullingMask;
        let staticMask = cameraCullInfo.staticMask;
        for (var i: number = 0, n: number = count; i < n; i++) {
            var render = renders[i];
            var canPass: boolean;
            canPass = (Math.pow(2, render.layer) & cullMask) != 0 && render.enable && (render.renderbitFlag == 0);
            canPass = canPass && ((render.staticMask & staticMask) != 0);
            if (canPass) {
                Stat.frustumCulling++;
                //needRender 方案有问题 会造成native和js的差异
                if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum))//NEEDRENDER TS OR NATIVE
                {
                    render.distanceForSort = Vector3.distance(render.bounds.getCenter(), cameraCullInfo.position);
                    render._renderUpdatePre(context);//TS OR Native
                    let elments = render.renderelements;
                    if (elments.length == 1) {//js 优化
                        if (elments[0]._materialRenderQueue > 2500) transparent.addRenderElement(elments[0]);
                        else opaqueList.addRenderElement(elments[0]);
                    } else {
                        for (var j: number = 0, m: number = elments.length; j < m; j++) {
                            var element = elments[j];
                            if (element._materialRenderQueue > 2500) transparent.addRenderElement(element);
                            else opaqueList.addRenderElement(element);
                        }
                    }
                }
            }
        }
    }



    static culldirectLightShadow(shadowCullInfo: ShadowCullInfo, list: GLESBaseRenderNode[], count: number, opaqueList: GLESRenderQueueList, context: GLESRenderContext3D) {
        opaqueList.clear();
        var renders = list;
        for (var i: number = 0, n: number = count; i < n; i++) {
            var render = renders[i];
            var canPass: boolean = render.shadowCullPass();
            if (canPass) {
                Stat.frustumCulling++;
                let pass = FrustumCulling.cullingRenderBounds(render.bounds, shadowCullInfo);
                if (pass) {
                    render.distanceForSort = Vector3.distance(render.bounds.getCenter(), shadowCullInfo.position);//TODO:合并计算浪费,或者合并后取平均值
                    render._renderUpdatePre(context);//TS OR Native
                    var elements = render.renderelements
                    for (var j: number = 0, m: number = elements.length; j < m; j++) {
                        var element = elements[j];
                        if (element._materialRenderQueue < 2500)
                            opaqueList.addRenderElement(element);
                    }
                }
            }
        }
    }


    static cullingSpotShadow(cameraCullInfo: CameraCullInfo, list: GLESBaseRenderNode[], count: number, opaqueList: GLESRenderQueueList, context: GLESRenderContext3D) {
        opaqueList.clear();
        let renders = list;
        let boundFrustum: BoundFrustum = cameraCullInfo.boundFrustum;
        for (let i = 0, n = count; i < n; i++) {
            let render = renders[i];
            let canPass: boolean = render.shadowCullPass();
            render._renderUpdatePre(context);//TS OR Native
            if (canPass) {
                Stat.frustumCulling++;
                render.distanceForSort = Vector3.distance(render.bounds.getCenter(), cameraCullInfo.position);
                if (render._needRender(boundFrustum)) {
                    let elements = render.renderelements;
                    for (var j: number = 0, m: number = elements.length; j < m; j++) {
                        var element = elements[j];
                        if (element._materialRenderQueue < 2500)
                            opaqueList.addRenderElement(element);
                    }
                }

            }
        }
    }
}