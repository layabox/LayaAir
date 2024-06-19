import { FrustumCulling } from "../../d3/graphics/FrustumCulling";
import { CameraCullInfo, ShadowCullInfo } from "../../d3/shadowMap/ShadowSliceData";
import { Vector3 } from "../../maths/Vector3";
import { Stat } from "../../utils/Stat";
import { IRenderContext3D, IRenderElement3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { RenderListQueue } from "./RenderListQueue";

/**
 * 裁剪通用工具类
 */
export class RenderCullUtil {
    /**
     * 相机裁剪
     * @param cameraCullInfo 相机裁剪信息
     * @param list 渲染节点列表
     * @param count 渲染节点数量（为什么不是list.length?）
     * @param opaqueList 不透明队列
     * @param transparent 透明队列
     * @param context 渲染上下文
     */
    static cullByCameraCullInfo(cameraCullInfo: CameraCullInfo, list: WebBaseRenderNode[],
        count: number, opaqueList: RenderListQueue, transparent: RenderListQueue, context: IRenderContext3D) {
        const boundFrustum = cameraCullInfo.boundFrustum;
        const cullMask = cameraCullInfo.cullingMask;
        const staticMask = cameraCullInfo.staticMask;
        let render: WebBaseRenderNode;
        let canPass: boolean;
        for (let i = 0; i < count; i++) {
            render = list[i];
            canPass = ((1 << render.layer) & cullMask) != 0 && (render.renderbitFlag == 0);
            canPass = canPass && ((render.staticMask & staticMask) != 0);
            if (canPass) {
                Stat.frustumCulling++;
                //needRender方案有问题, 会造成native和js的差异
                if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum)) {
                    render.distanceForSort = Vector3.distanceSquared(render.bounds._imp.getCenter(), cameraCullInfo.position);
                    render._renderUpdatePre(context);
                    let element: IRenderElement3D;
                    const elements = render.renderelements as IRenderElement3D[];
                    for (let j = 0, len = elements.length; j < len; j++) {
                        element = elements[j];
                        if (element.materialRenderQueue > 2500)
                            transparent.addRenderElement(element);
                        else opaqueList.addRenderElement(element);
                    }
                }
            }
        }
    }

    /**
     * 方向光源裁剪
     * @param shadowCullInfo 
     * @param list 
     * @param count 
     * @param opaqueList 
     * @param context 
     */
    static cullDirectLightShadow(shadowCullInfo: ShadowCullInfo, list: WebBaseRenderNode[],
        count: number, opaqueList: RenderListQueue, context: IRenderContext3D) {
        opaqueList.clear();
        for (let i = 0; i < count; i++) {
            const render = list[i];
            if (render.shadowCullPass()) {
                Stat.frustumCulling++;
                if (FrustumCulling.cullingRenderBounds(render.bounds, shadowCullInfo)) {
                    render.distanceForSort = Vector3.distanceSquared(render.bounds._imp.getCenter(), shadowCullInfo.position); //TODO:合并计算浪费,或者合并后取平均值
                    render._renderUpdatePre(context);
                    let element: IRenderElement3D;
                    const elements = render.renderelements as IRenderElement3D[];
                    for (let j = 0, len = elements.length; j < len; j++) {
                        element = elements[j];
                        if (element.materialRenderQueue < 2500)
                            opaqueList.addRenderElement(element);
                    }
                }
            }
        }
    }

    /**
     * 聚光灯裁剪
     * @param cameraCullInfo 
     * @param list 
     * @param count 
     * @param opaqueList 
     * @param context 
     */
    static cullSpotShadow(cameraCullInfo: CameraCullInfo, list: WebBaseRenderNode[],
        count: number, opaqueList: RenderListQueue, context: IRenderContext3D) {
        opaqueList.clear();
        const boundFrustum = cameraCullInfo.boundFrustum;
        for (let i = 0; i < count; i++) {
            const render = list[i];
            render._renderUpdatePre(context);
            if (render.shadowCullPass()) {
                Stat.frustumCulling++;
                render.distanceForSort = Vector3.distanceSquared(render.bounds._imp.getCenter(), cameraCullInfo.position);
                if (render._needRender(boundFrustum)) {
                    let element: IRenderElement3D;
                    const elements = render.renderelements as IRenderElement3D[];
                    for (let j = 0, len = elements.length; j < len; j++) {
                        element = elements[j];
                        if (element.materialRenderQueue < 2500)
                            opaqueList.addRenderElement(element);
                    }
                }
            }
        }
    }
}