import { NativeBaseRenderQueue } from "./NativeBaseRenderQueue";
import { NativeCullPassBase } from "./NativeCullPass";
import { NativeRenderContext3DOBJ } from "./NativeRenderContext3DOBJ";
import { NativeSceneRenderManager } from "./NativeSceneRenderManager";
import { NativeVertexBuffer3D } from "NativeVertexBuffer3D";
import { NativeShaderData } from "./NativeShaderData";
import { Bounds } from "../../../../d3/core/Bounds";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { Plane } from "../../../../d3/math/Plane";
import { Vector3 } from "../../../../d3/math/Vector3";
import { BufferUsage } from "../../../RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEnum/RenderPologyMode";
import { IRenderOBJCreate } from "../../../RenderInterface/IRenderOBJCreate";
import { IBaseRenderNode } from "../../../RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { ICullPass } from "../../../RenderInterface/RenderPipelineInterface/ICullPass";
import { IRenderContext3D } from "../../../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../../../RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../../../RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISceneRenderManager } from "../../../RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { ISortPass } from "../../../RenderInterface/RenderPipelineInterface/ISortPass";
import { SkinRenderElementOBJ } from "../../../RenderObj/SkinRenderElementOBJ";
import { ShaderData } from "../../../RenderShader/ShaderData";
import { NativePlane } from "./NativePlane";
import { NativeBoundSphere } from "./NativeBoundsSphere";
import { NativeTransform3D } from "./NativeTransform3D";
import { Matrix4x4 } from "../../../../d3/math/Matrix4x4";
import { NativeBoundFrustum } from "./NativeBoundFrustum";
import { IShadowCullInfo } from "../../../RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { ICameraCullInfo } from "../../../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { NativeShadowCullInfo } from "./NativeShadowCullInfo";
import { NativeCameraCullInfo } from "./NativeCameraCullInfo";
import { IndexBuffer3D } from "../../../../d3/graphics/IndexBuffer3D";
import { NativeIndexBuffer3D } from "../NativeOBJ/NativeIndexBuffer3D";
import { NativeRenderStateCommand } from "./NativeRenderStateCommand";

export class RenderOBJCreateUtil implements IRenderOBJCreate {
    createTransform(owner: Sprite3D): Transform3D {
        return new NativeTransform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): Bounds {
        return new Bounds(min, max);
    }

    createBoundsSphere(center: Vector3, radius: number): NativeBoundSphere {
        return new NativeBoundSphere(center, radius);
    }

    createPlane(normal: Vector3, d: number = 0): Plane {
        return new NativePlane(normal, d);
    }

    createBoundFrustum(matrix:Matrix4x4):NativeBoundFrustum{
        return new NativeBoundFrustum(matrix);
    }

    createShaderData(): ShaderData {
        return new NativeShaderData();
    }

    createRenderElement(): IRenderElement {
        return new (window as any).conchRenderElement();
    }
    createSkinRenderElement():IRenderElement{
        return new SkinRenderElementOBJ();
    }

    createBaseRenderQueue(isTransparent: boolean): IRenderQueue {
        var queue: NativeBaseRenderQueue = new NativeBaseRenderQueue(isTransparent);
        queue.sortPass = this.createSortPass();
        return queue;
    }

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return new (window as any).conchRenderGeometryElement(mode, drayType);
    }

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new NativeVertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false) :IndexBuffer3D{
        return new NativeIndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    createShaderInstance() {
        
    }

    createBaseRenderNode():IBaseRenderNode{
        return new (window as any).conchRenderNode();
    }

    createRenderContext3D():IRenderContext3D{
        return new NativeRenderContext3DOBJ();
    }

    createSceneRenderManager():ISceneRenderManager{
        return new NativeSceneRenderManager();
    }

    createCullPass():ICullPass{
        return new NativeCullPassBase();
    }

    createSortPass():ISortPass{
        return new (window as any).conchQuickSort();
    }

    createShadowCullInfo():IShadowCullInfo{
        return new NativeShadowCullInfo();
    }

    createCameraCullInfo():ICameraCullInfo{
        return new NativeCameraCullInfo();
    }

    createRenderStateComand(): NativeRenderStateCommand {
        throw new NativeRenderStateCommand();
    }
}