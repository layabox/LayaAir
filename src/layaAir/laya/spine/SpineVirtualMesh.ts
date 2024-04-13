import { IIndexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { Graphics } from "../display/Graphics";
import { LayaGL } from "../layagl/LayaGL";
import { Material } from "../resource/Material";
import { SpineMaterialShaderInit } from "./material/SpineMaterialShaderInit";

export class SpineVirtualMesh {
    static maxVertex: number = 10922;//64*1024/3/2  indexbuffer 64K限制
    static vertexSize: number = 8;
    /**
     * Geometry
     */
    geo: IRenderGeometryElement;
    /**
     * Material
     */
    material: Material;

    private vb: IVertexBuffer;
    private ib: IIndexBuffer;

    private vertexArray: Float32Array;
    private indexArray: Uint16Array;


    private verticesLength: number = 0;
    private indicesLength: number = 0;

    /**
     * Create a visual mesh
     * @param geo Geometry
     * @param material Material
     */
    constructor(material: Material) {
        this.material = material;
        this.vertexArray = new Float32Array(SpineVirtualMesh.maxVertex * SpineVirtualMesh.vertexSize);
        this.indexArray = new Uint16Array(SpineVirtualMesh.maxVertex * 3);
        let geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = LayaGL.renderDeviceFactory.createBufferState();
        geo.bufferState = mesh;
        let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = this.vertexDeclarition;
        let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
        this.geo = geo;
        this.vb = vb;
        this.ib = ib;
    }
    /**
     * 剪裁后的顶点和索引 
     * @param vertices 
     * @param indices 
     */
    appendVerticesClip(vertices: ArrayLike<number>, indices: ArrayLike<number>) {
        let indicesLength = indices.length;
        let verticesLength = vertices.length;
        let vertexSize = SpineVirtualMesh.vertexSize;
        let indexStart = this.verticesLength / vertexSize;
        let vertexBuffer = this.vertexArray;

        let before = this.verticesLength;
        let vlen = before;
        for (let j = 0; j < verticesLength; vlen++, j++) {
            vertexBuffer[vlen] = vertices[j];
        }

        this.verticesLength = before + verticesLength;

        let indicesArray = this.indexArray;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            indicesArray[i] = indices[j] + indexStart;
        this.indicesLength += indicesLength;

    }
    /**
     * 是否能附加 （长度是否够）
     * @param verticesLength 
     * @param indicesLength 
     * @returns 
     */
    canAppend(verticesLength: number, indicesLength: number) {
        return this.verticesLength + verticesLength < SpineVirtualMesh.maxVertex * SpineVirtualMesh.vertexSize && this.indicesLength + indicesLength < SpineVirtualMesh.maxVertex * 3;

    }
    /**
     * 附加顶点
     * @param vertices 
     * @param verticesLength 
     * @param indices 
     * @param indicesLength 
     * @param finalColor 
     * @param uvs 
     */
    appendVertices(vertices: ArrayLike<number>, verticesLength: number, indices: number[], indicesLength: number, finalColor: spine.Color, uvs: ArrayLike<number>) {
        let vertexSize = SpineVirtualMesh.vertexSize;
        let indexStart = this.verticesLength / vertexSize;
        let vertexBuffer = this.vertexArray;

        let before = this.verticesLength;

        for (let u = 0, v = 0, n = verticesLength; v < n; v += vertexSize, u += 2) {
            let size = before + v;
            vertexBuffer[size] = vertices[v];
            vertexBuffer[size + 1] = vertices[v + 1];
            vertexBuffer[size + 2] = finalColor.r;
            vertexBuffer[size + 3] = finalColor.g;
            vertexBuffer[size + 4] = finalColor.b;
            vertexBuffer[size + 5] = finalColor.a;
            vertexBuffer[size + 6] = uvs[u];
            vertexBuffer[size + 7] = uvs[u + 1];
        }

        this.verticesLength = before + verticesLength;

        let indicesArray = this.indexArray;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            indicesArray[i] = indices[j] + indexStart;
        this.indicesLength += indicesLength;
    }
    /**
     * 清空
     */
    clear() {
        this.verticesLength = 0;
        this.indicesLength = 0;
    }
    /**
     * 添加到渲染队列
     * @param graphics 
     */
    draw(graphics: Graphics) {
        let vb = this.vb;
        let ib = this.ib;
        let vblen = this.verticesLength * 4;
        let iblen = this.indicesLength * 2;

        vb.setDataLength(vblen);
        vb.setData(this.vertexArray.buffer, 0, 0, vblen)
        ib._setIndexDataLength(iblen)
        ib._setIndexData(new Uint16Array(this.indexArray.buffer, 0, iblen / 2), 0)
        this.geo.clearRenderParams();
        this.geo.setDrawElemenParams(iblen / 2, 0);
        graphics.drawGeo(this.geo, this.material);
    }

    get vertexDeclarition() {
        return SpineMaterialShaderInit.vertexDeclaration;
    }

}