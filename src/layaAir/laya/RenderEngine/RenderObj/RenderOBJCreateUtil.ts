import { Bounds } from "../../d3/core/Bounds";
import { RenderState } from "../../d3/core/material/RenderState";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Transform3D } from "../../d3/core/Transform3D";
import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { BoundFrustum } from "../../d3/math/BoundFrustum";
import { BoundSphere } from "../../d3/math/BoundSphere";
import { Matrix4x4 } from "../../d3/math/Matrix4x4";
import { Plane } from "../../d3/math/Plane";
import { Vector3 } from "../../d3/math/Vector3";
import { ShaderInstance } from "../../d3/shader/ShaderInstance";
import { ShaderCompileDefineBase } from "../../webgl/utils/ShaderCompileDefineBase";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEnum/DrawType";
import { IndexFormat } from "../RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEnum/RenderPologyMode";
import { IRenderOBJCreate } from "../RenderInterface/IRenderOBJCreate";
import { IBaseRenderNode } from "../RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { ICameraCullInfo } from "../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../RenderInterface/RenderPipelineInterface/ICullPass";
import { IRenderContext3D } from "../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISceneRenderManager } from "../RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { ISortPass } from "../RenderInterface/RenderPipelineInterface/ISortPass";
import { ShaderData, ShaderDataType } from "../RenderShader/ShaderData";
import { RenderStateCommand } from "../RenderStateCommand";
import { BaseRenderNode } from "./BaseRenderNode";
import { BaseRenderQueue } from "./BaseRenderQueue";
import { CameraCullInfo } from "./CameraCullInfo";
import { CullPassBase } from "./CullPass";
import { InstanceRenderElementOBJ } from "./InstanceRenderElementOBJ";
import { QuickSort } from "./QuickSort";
import { RenderContext3DOBJ } from "./RenderContext3DOBJ";
import { RenderElementOBJ } from "./RenderElementOBJ";
import { RenderGeometryElementOBJ } from "./RenderGeometryElementOBJ";
import { SceneRenderManager } from "./SceneRenderManager";
import { ShadowCullInfo } from "./ShadowCullInfo";
import { SkinRenderElementOBJ } from "./SkinRenderElementOBJ";

export class RenderOBJCreateUtil implements IRenderOBJCreate {

    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): Bounds {
        return new Bounds(min, max);
    }

    createBoundsSphere(center: Vector3, radius: number): BoundSphere {
        return new BoundSphere(center, radius);
    }

    createPlane(normal: Vector3, d: number = 0): Plane {
        return new Plane(normal, d);
    }

    createBoundFrustum(matrix: Matrix4x4): BoundFrustum {
        return new BoundFrustum(matrix);
    }

    createShaderData(): ShaderData {
        return new ShaderData();
    }

    createRenderElement(): IRenderElement {
        return new RenderElementOBJ();
    }
    createSkinRenderElement(): IRenderElement {
        return new SkinRenderElementOBJ();
    }
    createInstanceRenderElement() {
        return new InstanceRenderElementOBJ();
    }

    createBaseRenderQueue(isTransparent: boolean): IRenderQueue {
        var queue: BaseRenderQueue = new BaseRenderQueue(isTransparent);
        queue.sortPass = this.createSortPass();
        return queue;
    }

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return new RenderGeometryElementOBJ(mode, drayType);
    }

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new VertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new IndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }, shaderPass: ShaderCompileDefineBase): ShaderInstance {
        return new ShaderInstance(vs, ps, attributeMap, shaderPass);
    }

    createBaseRenderNode(): IBaseRenderNode {
        return new BaseRenderNode();
    }

    createRenderContext3D(): IRenderContext3D {
        return new RenderContext3DOBJ();
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManager();
    }

    createCullPass(): ICullPass {
        return new CullPassBase();
    }

    createSortPass(): ISortPass {
        return new QuickSort();
    }

    createShadowCullInfo(): IShadowCullInfo {
        return new ShadowCullInfo();
    }

    createCameraCullInfo(): ICameraCullInfo {
        return new CameraCullInfo();
    }

    createRenderStateComand(): RenderStateCommand {
        return new RenderStateCommand();
    }
    createRenderState(): RenderState {
        return new RenderState();
    }
}