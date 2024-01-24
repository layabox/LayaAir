import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderEngine3DOBJFactory } from "../../RenderDriverLayer/IRenderEngine3DOBJFactory";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { SceneRenderManagerOBJ } from "../RenderObj/SceneRenderManagerOBJ";
import { NativeIndexBuffer3D } from "./NativeIndexBuffer3D";
import { NativeRenderGeometryElementOBJ } from "./NativeRenderGeometryElementOBJ";
import { NativeVertexBuffer3D } from "./NativeVertexBuffer3D";


export class NativeGLRenderEngine3DOBJFactory implements IRenderEngine3DOBJFactory {
 
    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D {
        return new NativeVertexBuffer3D(byteLength, bufferUsage, canRead);
    }
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D {
        return new NativeIndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }
    createSceneRenderManager(): SceneRenderManagerOBJ {
        return new SceneRenderManagerOBJ();
    }
    createRenderGeometry(mode: MeshTopology, drayType: DrawType): NativeRenderGeometryElementOBJ {
        return new NativeRenderGeometryElementOBJ(mode, drayType);
    }

}