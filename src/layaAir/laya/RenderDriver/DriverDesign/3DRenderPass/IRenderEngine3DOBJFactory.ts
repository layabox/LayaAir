import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IndexBuffer3D } from "../../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../../d3/graphics/VertexBuffer3D";

/**
 * @deprecated
 */
export interface IRenderEngine3DOBJFactory {

    /**
     * @deprecated
     */
    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D;
    /**
     * @deprecated
     */
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D;


}