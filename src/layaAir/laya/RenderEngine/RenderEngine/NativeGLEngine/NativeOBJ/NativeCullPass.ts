import { SingletonList } from "../../../../d3/component/SingletonList";
import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { ICullPass } from "../../../RenderInterface/RenderPipelineInterface/ICullPass";
import { ISceneRenderManager } from "../../../RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { NativeCameraCullInfo } from "./NativeCameraCullInfo";
import { NativeShadowCullInfo } from "./NativeShadowCullInfo";


export class NativeCullPassBase implements ICullPass {
    private _nativeObj: any;
    get cullList():SingletonList<BaseRender>{
        return this._nativeObj.cullList;
    }

    constructor(){
        this._nativeObj = new (window as any).conchCullPass();
    }


    cullByCameraCullInfo(cameraCullInfo: NativeCameraCullInfo, renderManager: ISceneRenderManager): void {
        //TODO
        // this._cullList.length = 0;
        // var renders: ISingletonElement[] = renderManager.list.elements;
        // var boundFrustum: BoundFrustum = cameraCullInfo.boundFrustum;
        // var cullMask: number = cameraCullInfo.cullingMask;
        // let context = RenderContext3D._instance;
        // for (var i: number = 0, n: number = renderManager.list.length; i < n; i++) {
        //     var render: BaseRender = <BaseRender>renders[i];
        //     var canPass: boolean;
        //     canPass = ((Math.pow(2, (render.owner as Sprite3D)._layer) & cullMask) != 0) && render._enabled;
        //     if (canPass) {
        //         Stat.frustumCulling++;
        //         if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum, context)) {
                    
        //             this.cullList.add(render);
        //         }
        //     }
        // }
    }
    cullByShadowCullInfo(cullInfo: NativeShadowCullInfo, renderManager: ISceneRenderManager): void {
        //TODO
        // this._cullList.length = 0;
        // var renderList: SingletonList<ISingletonElement> = renderManager.list;
        // var renders: ISingletonElement[] = renderList.elements;
        // var position: Vector3 = cullInfo.position;
        // for (var i: number = 0, n: number = renderList.length; i < n; i++) {
		// 	var render: BaseRender = <BaseRender>renders[i];
		// 	var canPass: boolean = render.castShadow && render._enabled;
		// 	if (canPass) {
		// 		Stat.frustumCulling++;
		// 		let pass = FrustumCulling.cullingRenderBounds(render.bounds, cullInfo);
        //         pass&&this._cullList.add(render);
        //         // if (pass) {
		// 		// 	render.distanceForSort = Vector3.distance(render.bounds.getCenter(), position);//TODO:合并计算浪费,或者合并后取平均值
		// 		// 	var elements: RenderElement[] = render._renderElements;
		// 		// 	for (var j: number = 0, m: number = elements.length; j < m; j++)
		// 		// 		elements[j]._update(scene, context, null, null);
		// 		// }
		// 	}
		// }
    }
    cullingSpotShadow(cameraCullInfo: NativeCameraCullInfo, renderManager: ISceneRenderManager): void{
        //TODO
        // this._cullList.length = 0;
        // var renders: ISingletonElement[] = renderManager.list.elements;
        // var boundFrustum: BoundFrustum = cameraCullInfo.boundFrustum;
        // let context = RenderContext3D._instance;
        // for (var i: number = 0, n: number = renderManager.list.length; i < n; i++) {
        //     var render: BaseRender = <BaseRender>renders[i];
        //     var canPass: boolean = render.castShadow && render._enabled; 
        //     if (canPass&&render._needRender(cameraCullInfo.boundFrustum,context))
        //         this._cullList.add(render);
        // }
    }
    
}