import { Vector3 } from "../../../maths/Vector3";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderOBJCreate } from "../../../RenderEngine/RenderInterface/IRenderOBJCreate";
import { IBaseRenderNode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICullPass";
import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { ISortPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISortPass";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { ShaderData, ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { NativeBaseRenderNode } from "./NativeBaseRenderNode";
import { NativeBaseRenderQueue } from "./NativeBaseRenderQueue";
import { NativeBounds } from "./NativeBounds";
import { NativeCameraCullInfo } from "./NativeCameraCullInfo";
import { NativeCommandUniformMap } from "./NativeCommandUniformMap";
import { NativeCullPassBase } from "./NativeCullPass";
import { NativeIndexBuffer3D } from "./NativeIndexBuffer3D";
import { NativeInstanceRenderElementOBJ } from "./NativeInstanceRenderElementOBJ";
import { NativeRenderContext3DOBJ } from "./NativeRenderContext3DOBJ";
import { NativeRenderElementOBJ } from "./NativeRenderElementOBJ";
import { NativeRenderGeometryElementOBJ } from "./NativeRenderGeometryElementOBJ";
import { NativeRenderState } from "./NativeRenderState";
import { NativeRenderStateCommand } from "./NativeRenderStateCommand";
import { NativeSceneRenderManager } from "./NativeSceneRenderManager";
import { NativeShaderData } from "./NativeShaderData";
import { NativeShaderInstance } from "./NativeShaderInstance";
import { NativeShadowCullInfo } from "./NativeShadowCullInfo";
import { NativeSkinRenderElementOBJ } from "./NativeSkinRenderElementOBJ";
import { NativeTransform3D } from "./NativeTransform3D";
import { NativeUniformBufferObject } from "./NativeUniformBufferObject";
import { NativeVertexBuffer3D } from "./NativeVertexBuffer3D";


export class NativeRenderOBJCreateUtil implements IRenderOBJCreate {

    createTransform(owner: Sprite3D): Transform3D {
        return new NativeTransform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new NativeBounds(min, max);
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