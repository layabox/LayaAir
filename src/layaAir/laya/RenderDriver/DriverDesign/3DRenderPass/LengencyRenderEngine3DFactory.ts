import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { IndexBuffer3D } from "../../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../../d3/graphics/VertexBuffer3D";
import { IRenderEngine3DOBJFactory } from "./IRenderEngine3DOBJFactory";

/**
 * @deprecated
 */
export class LengencyRenderEngine3DFactory implements IRenderEngine3DOBJFactory {

    /**
     * @deprecated use new VertexBuffer3D
     * @param byteLength 
     * @param bufferUsage 
     * @param canRead 
     * @returns 
     */
    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new VertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    /**
     * @deprecated use new IndexBuffer3D
     * @param indexType 
     * @param indexCount 
     * @param bufferUsage 
     * @param canRead 
     * @returns 
     */
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new IndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }
}
Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();