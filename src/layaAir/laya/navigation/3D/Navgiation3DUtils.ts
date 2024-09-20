import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { Laya3DRender } from "../../d3/RenderObjs/Laya3DRender";
import { Mesh } from "../../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../../d3/resource/models/PrimitiveMesh";
import { Vector3 } from "../../maths/Vector3";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { NavigationUtils } from "../common/NavigationUtils";
import { NavMesh } from "./NavMesh";

const tempVector3 = new Vector3();

export class Navgiation3DUtils {

    static __init__() {
    }




    /**@internal  */
    static resetMesh(mesh: Mesh, vertexDeclaration: VertexDeclaration, vertices: Float32Array, indices: Uint16Array) {
        var vertexBuffer: VertexBuffer3D = Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertices.length * 4, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertices.buffer);
        mesh._vertexBuffer = vertexBuffer;
        mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
        var indexBuffer: IndexBuffer3D = Laya3DRender.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, indices.length, BufferUsage.Static, true);
        indexBuffer.setData(indices);
        mesh._indexBuffer = indexBuffer;

        mesh._setBuffer(vertexBuffer, indexBuffer);
        let subMesh = mesh.getSubMesh(0);
        //mesh._setInstanceBuffer(mesh._instanceBufferStateType);
        subMesh._vertexBuffer = vertexBuffer;
        subMesh._indexBuffer = indexBuffer;
        subMesh._setIndexRange(0, indexBuffer.indexCount);

        var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
        var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
        var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
        subIndexBufferStart.length = 1;
        subIndexBufferCount.length = 1;
        boneIndicesList.length = 1;
        subIndexBufferStart[0] = 0;
        subIndexBufferCount[0] = indexBuffer.indexCount;

        var memorySize: number = vertexBuffer._byteLength + indexBuffer._byteLength;
        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);
    }

    /**@internal  */
    static getTitleData(title: any, vbDatas: number[], center: Vector3, ibs: number[]): void {
        let header: any = title.getheader();
        if (!header) return null;
        const vboff = vbDatas.length / 6; //兼容WGSL
        let tvertCount: number = header.vertCount;
        let tailTris: number[] = title.getdetailTris();
        for (var i = 0; i < header.polyCount; i++) {
            let p: any = title.getPolys(i);
            let vertCount: number = p.vertCount;
            let pverts: number[] = p.getVerts();
            let pd: any = title.getPolyDetail(i);
            let triCount: number = pd.triCount;
            for (var j = 0; j < triCount; j++) {
                let index = (pd.triBase + j) * 4;
                for (var k = 0; k < 3; k++) {
                    const kvalue = tailTris[index + NavigationUtils.TitleMeshIbOff[k]];
                    if (kvalue < vertCount) {
                        ibs.push(pverts[kvalue] + vboff)
                    } else {
                        ibs.push(pd.vertBase + kvalue - vertCount + vboff + tvertCount)
                    }
                }
            }
        }
        let verts = title.getVerts();
        for (var i = 0, n = verts.length; i < n; i += 3) {
            vbDatas.push(verts[i] - center.x);
            vbDatas.push(verts[i + 1] - center.y);
            vbDatas.push(verts[i + 2] - center.z);
            vbDatas.push(0, 0, 0); //兼容WGSL
        }

        verts = title.getdetailVerts();
        for (var i = 0, n = verts.length; i < n; i += 3) {
            vbDatas.push(verts[i] - center.x);
            vbDatas.push(verts[i + 1] - center.y);
            vbDatas.push(verts[i + 2] - center.z);
            vbDatas.push(0, 0, 0); //兼容WGSL
        }
    }

    /**
     * create navMesh tile to Laya Mesh 
     * @param navMesh 
     * @param mesh
     */
    static createDebugMesh(navMesh: NavMesh, mesh: Mesh) {
        let m_navMesh = navMesh.navMesh;
        let tileCount = m_navMesh.getMaxTiles();
        let min = navMesh.navTileGrid.min;
        let max = navMesh.navTileGrid.max;
        let orig: Vector3 = tempVector3;
        Vector3.lerp(min, max, 0.5, orig);
        let poses: number[] = []
        let indexs: number[] = [];
        for (var i = 0; i < tileCount; i++) {
            Navgiation3DUtils.getTitleData(m_navMesh.getTile(i), poses, orig, indexs);
        }
        let vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL"); //兼容WSGL
        let vb = new Float32Array(poses);
        let ib = new Uint16Array(indexs);
        if (mesh == null) {
            mesh = PrimitiveMesh._createMesh(vertexDeclaration, vb, ib);
        } else {
            this.resetMesh(mesh, vertexDeclaration, vb, ib);
        }
        Vector3.subtract(max, orig, mesh.bounds.max);
        Vector3.subtract(min, orig, mesh.bounds.min);
        return mesh;
    }
}