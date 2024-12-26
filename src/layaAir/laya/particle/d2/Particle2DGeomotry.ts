import { LayaGL } from "../../layagl/LayaGL";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";

export class Particle2DGeomotry {

    bufferState: IBufferState;

    geometry: IRenderGeometryElement;

    indexBuffer: IIndexBuffer;

    particleBuffer: IVertexBuffer;

    particleDatas: Float32Array;

    readonly maxParitcleCount: number = 0;

    constructor(maxParticleCount: number, particleDeclaration: VertexDeclaration, meshDeclaration: VertexDeclaration) {
        this.maxParitcleCount = maxParticleCount;
        this.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        maxParticleCount += 1;
        {
            let vertexCount = 4 * maxParticleCount;

            // particle buffer
            let particleBuffer = this.particleBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            particleBuffer.vertexDeclaration = particleDeclaration;

            let particleFloatStride = particleDeclaration.vertexStride / 4;
            let particleData = this.particleDatas = new Float32Array(vertexCount * particleFloatStride);
            particleBuffer.setDataLength(particleData.byteLength);
            // particleBuffer.setData(particleData.buffer, 0, 0, particleData.byteLength);

            // mesh buffer
            let meshBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Static);
            meshBuffer.vertexDeclaration = meshDeclaration;

            let meshVertexCount = 4;
            let meshIndexCount = 6;
            let meshIndexOffset = 12;

            let meshFloatStride = meshDeclaration.vertexStride / 4;
            let meshData = new Float32Array(vertexCount * meshFloatStride);
            for (let i = 0; i < maxParticleCount; i++) {
                let offset = i * 4 * meshFloatStride;

                let pos0 = offset;
                meshData[pos0 + 0] = -0.5;
                meshData[pos0 + 1] = -0.5;
                meshData[pos0 + 2] = 0;
                meshData[pos0 + 3] = 0;

                let pos1 = offset + meshFloatStride;
                meshData[pos1 + 0] = 0.5;
                meshData[pos1 + 1] = -0.5;
                meshData[pos1 + 2] = 1;
                meshData[pos1 + 3] = 0;


                let pos2 = offset + 2 * meshFloatStride;
                meshData[pos2 + 0] = 0.5;
                meshData[pos2 + 1] = 0.5;
                meshData[pos2 + 2] = 1;
                meshData[pos2 + 3] = 1;

                let pos3 = offset + 3 * meshFloatStride;
                meshData[pos3 + 0] = -0.5;
                meshData[pos3 + 1] = 0.5;
                meshData[pos3 + 2] = 0;
                meshData[pos3 + 3] = 1;
            }
            meshBuffer.setDataLength(meshData.byteLength);
            meshBuffer.setData(meshData.buffer, 0, 0, meshData.byteLength);


            // ib
            let indexBuffer = this.indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Static);

            let indexCount = 6 * maxParticleCount;
            let indexFormat = vertexCount > 65535 ? IndexFormat.UInt32 : IndexFormat.UInt16;

            let indexData: Uint16Array | Uint32Array;
            if (indexFormat == IndexFormat.UInt16) {
                indexData = new Uint16Array(indexCount);
            }
            else {
                indexData = new Uint32Array(indexCount);
            }
            const meshIndies = [0, 1, 2, 0, 2, 3];
            for (let i = 0; i < maxParticleCount; i++) {
                let offset = i * 6;
                indexData[offset + 0] = meshIndies[0] + 4 * i;
                indexData[offset + 1] = meshIndies[1] + 4 * i;
                indexData[offset + 2] = meshIndies[2] + 4 * i;
                indexData[offset + 3] = meshIndies[3] + 4 * i;
                indexData[offset + 4] = meshIndies[4] + 4 * i;
                indexData[offset + 5] = meshIndies[5] + 4 * i;
            }

            indexBuffer.indexCount = indexCount;
            indexBuffer.indexType = indexFormat;

            indexBuffer._setIndexDataLength(indexData.byteLength);
            indexBuffer._setIndexData(indexData, 0);

            this.bufferState.applyState([meshBuffer, particleBuffer], indexBuffer);
        }

        {
            // create geometry
            let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            // geometry.setDrawElemenParams(6 * maxParticleCount, 0);
            geometry.indexFormat = this.indexBuffer.indexType;
            geometry.bufferState = this.bufferState;

            this.geometry = geometry;
        }

    }

    destroy() {
        this.geometry.destroy();
        this.bufferState.destroy();
    }
}