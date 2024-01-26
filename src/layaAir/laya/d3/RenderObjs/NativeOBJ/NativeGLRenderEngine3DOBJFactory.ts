import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IRenderEngine3DOBJFactory } from "../../RenderDriverLayer/IRenderEngine3DOBJFactory";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { SceneRenderManagerOBJ } from "../RenderObj/SceneRenderManagerOBJ";


export class NativeGLRenderEngine3DOBJFactory implements IRenderEngine3DOBJFactory {
 
    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D {
        //return new NativeVertexBuffer3D(byteLength, bufferUsage, canRead);
        return null;
    }
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D {
      return null;
    }
    createSceneRenderManager(): SceneRenderManagerOBJ {
        return new SceneRenderManagerOBJ();
    }
    // createRenderGeometry(mode: MeshTopology, drayType: DrawType): NativeRenderGeometryElementOBJ {
    //     return new NativeRenderGeometryElementOBJ(mode, drayType);
    // }

}