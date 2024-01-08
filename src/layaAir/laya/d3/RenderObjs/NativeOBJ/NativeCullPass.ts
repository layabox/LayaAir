
// import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
// import { ICullPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICullPass";
// import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
// import { IShadowCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
// import { SingletonList } from "../../../utils/SingletonList";
// import { Stat } from "../../../utils/Stat";
// import { BaseRender } from "../../core/render/BaseRender";
// import { RenderContext3D } from "../../core/render/RenderContext3D";
// import { FrustumCulling } from "../../graphics/FrustumCulling";
// import { NativeCameraCullInfo } from "./NativeCameraCullInfo";


// export class NativeCullPassBase implements ICullPass {

//     private _nativeObj: any;
//     private _tempRenderList: SingletonList<BaseRender>;
//     get cullList(): SingletonList<BaseRender> {
//         this._tempRenderList.elements = this._nativeObj.cullList;
//         this._tempRenderList.length = this._nativeObj.cullList.length;
//         return this._tempRenderList;
//     }

//     constructor() {
//         this._nativeObj = new (window as any).conchCullPass();
//         this._tempRenderList = new SingletonList<BaseRender>();
//     }

//     cullByCameraCullInfo(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {
//         //native Cull 
//         (cameraCullInfo as NativeCameraCullInfo).serialize();
//         Stat.frustumCulling += this._nativeObj.cullByCameraCullInfo((cameraCullInfo as any)._nativeObj, (renderManager as any)._sceneManagerOBJ._nativeObj);
//         //Custom list Cull
//         var customRenderList = (renderManager as any)._sceneManagerOBJ._customCullList;
//         var boundFrustum = cameraCullInfo.boundFrustum;
//         var cullMask: number = cameraCullInfo.cullingMask;
//         let staticMask = cameraCullInfo.staticMask;
//         var renders = customRenderList.elements;
//         let context = RenderContext3D._instance;
//         for (var i: number = 0, n: number = customRenderList.length; i < n; i++) {
//             var render: BaseRender = <BaseRender>renders[i];
//             var canPass: boolean;
//             canPass = (Math.pow(2, render.renderNode.layer & cullMask) != 0) && render._enabled && (render.renderbitFlag == 0);
//             canPass = canPass && (( render.renderNode.staticMask & staticMask) != 0);
//             if (canPass) {
//                 Stat.frustumCulling++;
//                 if (!cameraCullInfo.useOcclusionCulling || render._needRender(boundFrustum, context)) {
//                     this._nativeObj.cullList.push(render);
//                 }
//             }
//         }
//     }
//     cullByShadowCullInfo(cullInfo: IShadowCullInfo, renderManager: ISceneRenderManager): void {
//         //native Cull
//         //TODO transparent filter
//         Stat.frustumCulling += this._nativeObj.cullByShadowCullInfo((cullInfo as any)._nativeObj, (renderManager as any)._sceneManagerOBJ._nativeObj);
//         //Custom list Cull
//         var customRenderList = (renderManager as any)._sceneManagerOBJ._customCullList;
//         var renders = customRenderList.elements;
//         for (var i: number = 0, n: number = customRenderList.length; i < n; i++) {
//             var render: BaseRender = <BaseRender>renders[i];
//             var canPass: boolean = render.castShadow && render._enabled && (render.renderbitFlag == 0);
//             if (canPass) {
//                 Stat.frustumCulling++;
//                 let pass = FrustumCulling.cullingRenderBounds(render.bounds, cullInfo);
//                 pass && this._nativeObj.cullList.push(render);
//             }
//         }
//     }
//     cullingSpotShadow(cameraCullInfo: ICameraCullInfo, renderManager: ISceneRenderManager): void {
//         //native Cull
//         (cameraCullInfo as NativeCameraCullInfo).serialize();
//         //TODO transparent filter
//         Stat.frustumCulling += this._nativeObj.cullingSpotShadow((cameraCullInfo as any)._nativeObj, (renderManager as any)._sceneManagerOBJ._nativeObj);

//         //Custom list Cull
//         var customRenderList = (renderManager as any)._sceneManagerOBJ._customCullList;
//         var renders = customRenderList.elements;
//         let context = RenderContext3D._instance;
//         for (var i: number = 0, n: number = customRenderList.length; i < n; i++) {
//             var render: BaseRender = <BaseRender>renders[i];
//             var canPass: boolean = render.castShadow && render._enabled && (render.renderbitFlag == 0);
//             if (canPass) {
//                 Stat.frustumCulling++;
//                 var render: BaseRender = <BaseRender>renders[i];
//                 if (render._needRender(cameraCullInfo.boundFrustum, context))
//                     this._nativeObj.cullList.push(render);
//             }
//         }
//     }

// }