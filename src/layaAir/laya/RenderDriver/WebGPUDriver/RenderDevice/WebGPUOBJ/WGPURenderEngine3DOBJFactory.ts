import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { SceneRenderManagerOBJ } from "../../../../d3/core/scene/SceneRenderManagerOBJ";
import { IndexBuffer3D } from "../../../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../../../d3/graphics/VertexBuffer3D";
import { BoundsImpl } from "../../../../d3/math/BoundsImpl";
import { Vector3 } from "../../../../maths/Vector3";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { InstanceRenderElementOBJ } from "../../../WebglDriver/3DRenderPass/InstanceRenderElementOBJ";
import { WGPURenderContext3D } from "./WGPURenderContext3D";
import { WGPURenderElementObJ } from "./WGPURenderElementObJ";


export class WGPURenderEngine3DOBJFactory {
    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new BoundsImpl(min, max);
    }

    createRenderElement(): WGPURenderElementObJ {
        return new WGPURenderElementObJ();
    }

    createSkinRenderElement(): WGPURenderElementObJ {//TODO
        return null;
    }

    createInstanceRenderElement() {//TODO
        return new InstanceRenderElementOBJ();
    }

    // createBaseRenderQueue(isTransparent: boolean): IRenderQueue {
    //     var queue: BaseRenderQueue = new BaseRenderQueue(isTransparent);
    //     queue.sortPass = this.createSortPass();
    //     return queue;
    // }

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new VertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new IndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    
    createSceneRenderManager(): SceneRenderManagerOBJ {
        return new SceneRenderManagerOBJ();
    }
    
    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return null;
        //return new RenderGeometryElementOBJ(mode, drayType);
    }

    // createBaseRenderNode(): BaseRenderNode {
    //     return new BaseRenderNode();
    // }

    createRenderContext3D(): WGPURenderContext3D {
        return new WGPURenderContext3D();
    }
}