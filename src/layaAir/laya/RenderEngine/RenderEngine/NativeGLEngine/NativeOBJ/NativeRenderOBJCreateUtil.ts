import { NativeBaseRenderQueue } from "./NativeBaseRenderQueue";
import { NativeCullPassBase } from "./NativeCullPass";
import { NativeRenderContext3DOBJ } from "./NativeRenderContext3DOBJ";
import { NativeSceneRenderManager } from "./NativeSceneRenderManager";
import { NativeVertexBuffer3D } from "./NativeVertexBuffer3D";
import { NativeShaderData } from "./NativeShaderData";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
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
import { ShaderData, ShaderDataType } from "../../../RenderShader/ShaderData";
import { NativeTransform3D } from "./NativeTransform3D";
import { IShadowCullInfo } from "../../../RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { ICameraCullInfo } from "../../../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { NativeShadowCullInfo } from "./NativeShadowCullInfo";
import { NativeCameraCullInfo } from "./NativeCameraCullInfo";
import { IndexBuffer3D } from "../../../../d3/graphics/IndexBuffer3D";
import { NativeIndexBuffer3D } from "../NativeOBJ/NativeIndexBuffer3D";
import { NativeRenderStateCommand } from "./NativeRenderStateCommand";
import { ShaderCompileDefineBase } from "../../../../webgl/utils/ShaderCompileDefineBase";
import { NativeShaderInstance } from "./NativeShaderInstance";
import { ShaderInstance } from "../../../../d3/shader/ShaderInstance";
import { NativeRenderElementOBJ } from "./NativeRenderElementOBJ";
import { RenderState } from "../../../../d3/core/material/RenderState";
import { NativeRenderState } from "./NativeRenderState";
import { NativeRenderGeometryElementOBJ } from "./NativeRenderGeometryElementOBJ";
import { NativeSkinRenderElementOBJ } from "./NativeSkinRenderElementOBJ";
import { NativeBounds } from "./NativeBounds";
import { NativeInstanceRenderElementOBJ } from "./NativeInstanceRenderElementOBJ";
import { UniformBufferObject } from "../../../UniformBufferObject";
import { NativeUniformBufferObject } from "./NativeUniformBufferObject";
import { NativeCommandUniformMap } from "./NativeCommandUniformMap";
import { RenderBounds } from "../../../../d3/core/RenderBounds";
import { NativeBaseRenderNode } from "./NativeBaseRenderNode";

export class NativeRenderOBJCreateUtil implements IRenderOBJCreate {

    createTransform(owner: Sprite3D): Transform3D {
        return new NativeTransform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): RenderBounds {
        return new NativeBounds(min, max) as unknown as RenderBounds;
    }

    createShaderData(): ShaderData {
        return new NativeShaderData();
    }

    createRenderElement(): IRenderElement {
        return new NativeRenderElementOBJ();
    }
    createSkinRenderElement(): IRenderElement {
        return new NativeSkinRenderElementOBJ();
    }
    createInstanceRenderElement(): IRenderElement {
        return new NativeInstanceRenderElementOBJ();
    }
    createBaseRenderQueue(isTransparent: boolean): IRenderQueue {
        var queue: NativeBaseRenderQueue = new NativeBaseRenderQueue(isTransparent);
        queue.sortPass = this.createSortPass();
        return queue;
    }

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return new NativeRenderGeometryElementOBJ(mode, drayType);
    }

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new NativeVertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new NativeIndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }, shaderPass: ShaderCompileDefineBase): ShaderInstance {
        return new NativeShaderInstance(vs, ps, attributeMap, shaderPass) as unknown as ShaderInstance;
    }

    createBaseRenderNode(): IBaseRenderNode {
        return new NativeBaseRenderNode();
    }

    createRenderContext3D(): IRenderContext3D {
        return new NativeRenderContext3DOBJ();
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new NativeSceneRenderManager();
    }

    createCullPass(): ICullPass {
        return new NativeCullPassBase();
    }

    createSortPass(): ISortPass {
        return new (window as any).conchQuickSort();
    }

    createShadowCullInfo(): IShadowCullInfo {
        return new NativeShadowCullInfo();
    }

    createCameraCullInfo(): ICameraCullInfo {
        return new NativeCameraCullInfo();
    }

    createRenderStateComand(): NativeRenderStateCommand {
        return new NativeRenderStateCommand();
    }
    createRenderState(): RenderState {
        return new NativeRenderState() as unknown as RenderState;
    }

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        return new NativeUniformBufferObject(glPointer, name, bufferUsage, byteLength, isSingle);
    }

    createGlobalUniformMap(blockName: string): NativeCommandUniformMap{
        return new NativeCommandUniformMap((window as any).conchCommandUniformMap.createGlobalUniformMap(blockName), blockName);
    }
}