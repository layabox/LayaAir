// import { ICameraCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
// import { IShadowCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
// import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
// import { PixelLineSprite3D } from "../../pixelLine/PixelLineSprite3D";
// import { RenderContext3D } from "../../render/RenderContext3D";
// import { IOctreeObject } from "../IOctreeObject";

// export interface ISceneRenderManager {
//     /**增加一个渲染节点 */
//     addRender(object: IOctreeObject):void
//     /**减少一个渲染节点 */
//     removeRender(object: IOctreeObject):void
//     /**添加运动物体。 */
//     addMotionObject(object: IOctreeObject): void 
//     /**移除运动物体。 */
//     removeMotionObject(object: IOctreeObject): void 
//     /**释放一个管理节点 */
//     destroy():void
//     /**裁剪之前的更新 */
//     preFruUpdate():void
//     /**直射光裁剪 */
//     cullingShadow(cullInfo:IShadowCullInfo,context:RenderContext3D):void
//     /**获取与指定视锥相交的的物理列表。 */
//     getCollidingWithFrustum(cameraCullInfo: ICameraCullInfo, context: RenderContext3D, shader: Shader3D, replacementTag: string, isShadowCasterCull: boolean):void;
//     /**
// 	 * @internal
// 	 * [Debug]
// 	 */
//     drawAllBounds(pixelLine: PixelLineSprite3D):void;
//    	/**
// 	 * @internal
// 	 * [Debug]
// 	 */
//     drawAllObjects(pixelLine: PixelLineSprite3D):void;

// }