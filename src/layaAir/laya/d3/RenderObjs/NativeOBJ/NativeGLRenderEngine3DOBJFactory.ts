// import { Vector3 } from "../../../maths/Vector3";
// import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
// import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
// import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
// import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
// import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
// import { ICullPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICullPass";
// import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
// import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
// import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
// import { IShadowCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
// import { ISortPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISortPass";
// import { Sprite3D } from "../../core/Sprite3D";
// import { Transform3D } from "../../core/Transform3D";
// import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
// import { IRenderEngine3DOBJFactory } from "../IRenderEngine3DOBJFactory";
// import { NativeBaseRenderNode } from "./NativeBaseRenderNode";
// import { NativeBaseRenderQueue } from "./NativeBaseRenderQueue";
// import { NativeBounds } from "./NativeBounds";
// import { NativeCameraCullInfo } from "./NativeCameraCullInfo";
// import { NativeCullPassBase } from "./NativeCullPass";
// import { NativeIndexBuffer3D } from "./NativeIndexBuffer3D";
// import { NativeInstanceRenderElementOBJ } from "./NativeInstanceRenderElementOBJ";
// import { NativeRenderContext3DOBJ } from "./NativeRenderContext3DOBJ";
// import { NativeRenderElementOBJ } from "./NativeRenderElementOBJ";
// import { NativeRenderGeometryElementOBJ } from "./NativeRenderGeometryElementOBJ";
// import { NativeSceneRenderManager } from "./NativeSceneRenderManager";
// import { NativeShadowCullInfo } from "./NativeShadowCullInfo";
// import { NativeSkinRenderElementOBJ } from "./NativeSkinRenderElementOBJ";
// import { NativeTransform3D } from "./NativeTransform3D";
// import { NativeVertexBuffer3D } from "./NativeVertexBuffer3D";


// export class NativeGLRenderEngine3DOBJFactory implements IRenderEngine3DOBJFactory{
//     createTransform(owner: Sprite3D): Transform3D {
//         return new NativeTransform3D(owner);
//     }

//     createBounds(min: Vector3, max: Vector3): any {
//         return new NativeBounds(min, max);
//     }

//     createRenderElement(): IRenderElement {
//         return new NativeRenderElementOBJ();
//     }

//     createSkinRenderElement(): IRenderElement {
//         return new NativeSkinRenderElementOBJ();
//     }

//     createInstanceRenderElement(): IRenderElement {
//         return new NativeInstanceRenderElementOBJ();
//     }

//     createBaseRenderQueue(isTransparent: boolean): IRenderQueue {
//         var queue: NativeBaseRenderQueue = new NativeBaseRenderQueue(isTransparent);
//         queue.sortPass = this.createSortPass();
//         return queue;
//     }

//     createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
//         return new NativeVertexBuffer3D(byteLength, bufferUsage, canRead);
//     }

//     createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
//         return new NativeIndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
//     }

//     createSceneRenderManager(): ISceneRenderManager {
//         return new NativeSceneRenderManager();
//     }

//     createCullPass(): ICullPass {
//         return new NativeCullPassBase();
//     }

//     createSortPass(): ISortPass {
//         return new (window as any).conchQuickSort();
//     }

//     createShadowCullInfo(): IShadowCullInfo {
//         return new NativeShadowCullInfo();
//     }

//     createCameraCullInfo(): ICameraCullInfo {
//         return new NativeCameraCullInfo();
//     }

//     createBaseRenderNode(): NativeBaseRenderNode {
//         return new NativeBaseRenderNode();
//     }

//     createRenderContext3D(): NativeRenderContext3DOBJ {
//         return new NativeRenderContext3DOBJ();
//     }

//     createRenderGeometry(mode: MeshTopology, drayType: DrawType): NativeRenderGeometryElementOBJ {
//         return new NativeRenderGeometryElementOBJ(mode,drayType);
//     }
// }