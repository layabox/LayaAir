import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { Bounds } from "../../d3/math/Bounds";
import { Mesh } from "../../d3/resource/models/Mesh";
import { SubMesh } from "../../d3/resource/models/SubMesh";
import { Vector3 } from "../../maths/Vector3";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { PmxObject } from "./Parser/pmxObject";

export function mmdToMesh(info: PmxObject): Mesh {
    var mesh: Mesh = new Mesh();
    let subMeshes = mesh._subMeshes;
    //创建mesh
    //vertex buffer
    {
        let vertices = info.vertices;
        let vertexCount = vertices.length;
        const vertexSize = 12 + 12 + 8 + //pos+norm+uv
            + 16 + 16; //  boneIndices(4) + boneWeights(4)
        const vertexData = new ArrayBuffer(vertexCount * vertexSize);
        const positionArray = new Float32Array(vertexData, 0, vertexCount * 3);
        const normalArray = new Float32Array(vertexData, vertexCount * 12, vertexCount * 3);
        const uvArray = new Float32Array(vertexData, vertexCount * 24, vertexCount * 2);
        // 修改：将骨骼索引和权重数组扩展为4个元素
        const boneIndicesArray = new Uint16Array(vertexData, vertexCount * 32, vertexCount * 4);
        const boneWeightsArray = new Float32Array(vertexData, vertexCount * 40, vertexCount * 4);

        let minx = 10000, miny = 10000, minz = 10000;
        let maxx = -10000, maxy = -10000, maxz = -10000;

        for (let i = 0; i < vertexCount; i++) {
            // 读取位置
            let curVert = vertices[i];
            let x = curVert.position[0];
            let y = curVert.position[1];
            let z = curVert.position[2];
            if (x < minx) minx = x; if (x > maxx) maxx = x;
            if (y < miny) miny = y; if (y > maxy) maxy = y;
            if (z < minz) minz = z; if (z > maxz) maxz = z;
            positionArray[i * 3] = x;
            positionArray[i * 3 + 1] = y;
            positionArray[i * 3 + 2] = z;

            // 读取法线
            normalArray[i * 3] = curVert.normal[0];
            normalArray[i * 3 + 1] = curVert.normal[1];
            normalArray[i * 3 + 2] = curVert.normal[2];

            // 读取UV
            uvArray[i * 2] = curVert.uv[0];
            uvArray[i * 2 + 1] = 1 - curVert.uv[1]; // 修改：PMX的UV坐标系与常见3D坐标系不同，需要翻转Y轴

            // 读取骨骼权重类型
            const weightType = curVert.weightType;
            // 修改：重写骨骼权重读取逻辑
            switch (weightType) {
                case 0: // BDEF1
                    let boneweight0 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    boneIndicesArray[i * 4] = boneweight0.boneIndices;//TODO 根据 this._modelInfo.boneIndexSize
                    boneWeightsArray[i * 4] = 1.0;
                    break;
                case 1: // BDEF2
                    let boneweight1 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    boneIndicesArray[i * 4] = boneweight1.boneIndices[0];
                    boneIndicesArray[i * 4 + 1] = boneweight1.boneIndices[1];
                    boneWeightsArray[i * 4] = boneweight1.boneWeights;
                    boneWeightsArray[i * 4 + 1] = 1 - boneweight1.boneWeights;
                    break;
                case 2: // BDEF4
                    let boneweight2 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    for (let j = 0; j < 4; j++) {
                        boneIndicesArray[i * 4 + j] = boneweight2.boneIndices[j];
                    }
                    //这种情况下权重和不保证=1
                    for (let j = 0; j < 4; j++) {
                        boneWeightsArray[i * 4 + j] = boneweight2.boneWeights[j];
                    }
                    break;
                case 3: // SDEF
                    let boneweight3 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    console.log("SDEF weight type not fully supported");
                    // 简化处理SDEF，仅读取必要数据
                    for (let j = 0; j < 2; j++) {
                        boneIndicesArray[i * 4 + j] = boneweight3.boneIndices[j];
                    }
                    boneWeightsArray[i * 4] = boneweight3.boneWeights.boneWeight0;
                    boneWeightsArray[i * 4 + 1] = 1 - boneWeightsArray[i * 4];
                    boneweight3.boneWeights.c;
                    boneweight3.boneWeights.r0;
                    boneweight3.boneWeights.r1;
                    break;
                case 4://QDEF
                    throw '2'
                    break;
                default:
                    throw '3'
                    console.error("Unknown weight type:", weightType);
                    break;
            }

            // 读取边缘放大率
            const edgeScale = curVert.edgeScale;
        }

        const vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV,BLENDWEIGHT,BLENDINDICES");
        const vertexBuffer = new VertexBuffer3D(vertexData.byteLength, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertexData);

        mesh._vertexBuffer = vertexBuffer;
        mesh._vertexCount = vertexCount;
        mesh.bounds = new Bounds(new Vector3(minx, miny, minz), new Vector3(maxx, maxy, maxz));
    }
    //index buffer
    const indexCount = info.indices.length;
    // const indexData = new Uint16Array(indexCount);
    // for (let i = 0; i < indexCount; i++) {
    // }

    const indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, indexCount, BufferUsage.Static, true);
    indexBuffer.setData(info.indices);

    mesh._indexBuffer = indexBuffer;
    mesh._indexFormat = IndexFormat.UInt16;
    mesh._setBuffer(mesh._vertexBuffer, indexBuffer);

    //创建submesh
    const subMesh = new SubMesh(mesh);
    subMesh._indexBuffer = mesh._indexBuffer;
    subMesh._vertexBuffer = mesh._vertexBuffer;
    subMesh._setIndexRange(0, indexCount);
    //subMesh.material = material;
    subMeshes.push(subMesh);

    mesh._setSubMeshes(subMeshes);

    return mesh;

    //material
    mesh.calculateBounds();
    return mesh;
}