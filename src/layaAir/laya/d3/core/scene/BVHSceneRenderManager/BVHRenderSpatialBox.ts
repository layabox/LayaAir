import { ICameraCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { IShadowCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { SingletonList } from "../../../../utils/SingletonList";
import { Stat } from "../../../../utils/Stat";
import { FrustumCulling } from "../../../graphics/FrustumCulling";
import { BoundFrustum } from "../../../math/BoundFrustum";
import { BaseRender } from "../../render/BaseRender";
import { RenderContext3D } from "../../render/RenderContext3D";
import { BVHSpatialBox } from "../bvh/BVHSpatialBox";

export class BVHRenderBox<T> extends BVHSpatialBox<T>{

    /**@internal BVH实例数组 */
    protected _cellList: Array<BaseRender>;

    /**
     * Override it
     * @returns 
     */
    protected _creatChildNode(): BVHSpatialBox<T> {
        return new BVHRenderBox<BaseRender>(this._bvhmanager, this._config);
    }

    /**
     * 通过CameraCull查找逻辑对象
     * @override
     * @param frustum 视锥
     * @param out 输出逻辑对象组
     */
    getItemByCameraCullInfo(cameraCullInfo: ICameraCullInfo, out: SingletonList<BaseRender>) {
        var frustum: BoundFrustum = cameraCullInfo.boundFrustum;
        const result = frustum.containsBoundBox(this._bounds);
        if (result == 1) {
            this.traverseBoundsCell(out); //遍历分支，添加所有逻辑对象
            Stat.frustumCulling++;
        } //完全包含
        else if (result == 2) { //部分包含
            if (this.isContentBox()) {
                var cullMask: number = cameraCullInfo.cullingMask;
                let staticMask = cameraCullInfo.staticMask;
                let context = RenderContext3D._instance;
                for (let i = 0; i < this._cellList.length; i++) { //逐个判断逻辑对象包围盒是否和视锥有交集
                    var canPass: boolean;
                    let render = this._cellList[i]
                    canPass = ((1 << render.renderNode.layer) & cullMask) != 0 && render._enabled && (render.renderbitFlag == 0);
                    canPass = canPass && ((render.renderNode.staticMask & staticMask) != 0);
                    if (canPass) {
                        Stat.frustumCulling++;
                        if (!cameraCullInfo.useOcclusionCulling || render._needRender(frustum, context)) {
                            out.add(render);
                        }
                    }
                }
            } else {
                this._children0.getItemByCameraCullInfo(cameraCullInfo, out); //处理子空间
                this._children1.getItemByCameraCullInfo(cameraCullInfo, out); //处理子空间
            }
        }
    }

    /**
    * 通过阴影裁剪信息查找逻辑对象
    * @override
    * @param sci
    * @param out 
    */
    getItemBySCI(sci: IShadowCullInfo, out: SingletonList<BaseRender>) {
        const result = BVHSpatialBox.sciContainsBox(this._bounds, sci);
        if (result == 1) //完全包含
            this.traverseBoundsCell(out); //遍历分支，添加所有逻辑对象
        else if (result == 2) { //部分包含
            if (this.isContentBox()) {
                for (let i = 0; i < this._cellList.length; i++) { //逐个判断逻辑对象包围盒是否和视锥有交集
                    var render = this._cellList[i];
                    var canPass = render.shadowCullPass();
                    if (canPass) {
                        Stat.frustumCulling++;
                        let pass = FrustumCulling.cullingRenderBounds(render.bounds, sci);
                        pass && out.add(render);
                    }
                    // if (BVHSpatialBox.sciIntersectsBox(this._cellList[i].bounds, sci))
                    //     out.add(this._cellList[i]);
                }
            } else {
                this._children0.getItemBySCI(sci, out); //处理子空间
                this._children1.getItemBySCI(sci, out); //处理子空间
            }
        }
    }

}