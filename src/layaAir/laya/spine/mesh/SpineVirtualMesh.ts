import { type VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Material } from "../../resource/Material";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { SpineMeshBase } from "./SpineMeshBase";

/**
 * @en SpineVirtualMesh class for handling Spine skeleton mesh rendering.
 * @zh SpineVirtualMesh 类用于处理 Spine 骨骼网格渲染。
 */
export class SpineVirtualMesh extends SpineMeshBase {
    /**
     * @en Size of each vertex in the vertex array.
     * @zh 顶点数组中每个顶点的大小。
     */
    static vertexSize: number = 8;
    /**
     * @en Shared vertex array for all instances.
     * @zh 所有实例共享的顶点数组。
     */
    static vertexArray: Float32Array;
    /**
     * @en Shared index array for all instances.
     * @zh 所有实例共享的索引数组。
     */
    static indexArray: Uint16Array;
    /**
     * @en Create a SpineVirtualMesh instance.
     * @param material Material to be used for rendering.
     * @zh 创建 SpineVirtualMesh 实例。
     * @param material 用于渲染的材质。
     */
    constructor(material: Material) {
        super(material);
        if (SpineVirtualMesh.vertexArray == null) {
            SpineVirtualMesh.vertexArray = new Float32Array(SpineMeshBase.maxVertex * SpineVirtualMesh.vertexSize);
            SpineVirtualMesh.indexArray = new Uint16Array(SpineMeshBase.maxVertex * 3);
        }
        this.vertexArray = SpineVirtualMesh.vertexArray;
        this.indexArray = SpineVirtualMesh.indexArray;
    }
    /**
     * @en Append clipped vertices and indices.
     * @param vertices Array of vertex data.
     * @param indices Array of index data.
     * @zh 裁剪后的顶点和索引。
     * @param vertices 顶点数据数组。
     * @param indices 索引数据数组。
     */
    appendVerticesClip(vertices: ArrayLike<number>, indices: ArrayLike<number>) {
        let indicesLength = indices.length;
        let verticesLength = vertices.length;
        let vertexSize = SpineVirtualMesh.vertexSize;
        let indexStart = this.verticesLength / vertexSize;
        let vertexBuffer = this.vertexArray;

        let before = this.verticesLength;
        let vlen = before;
        for (let j = 0; j < verticesLength; vlen += 8, j += 8) {
            vertexBuffer[vlen] = vertices[j + 6];
            vertexBuffer[vlen + 1] = vertices[j + 7];
            vertexBuffer[vlen + 2] = vertices[j + 2];
            vertexBuffer[vlen + 3] = vertices[j + 3];
            vertexBuffer[vlen + 4] = vertices[j + 4];
            vertexBuffer[vlen + 5] = vertices[j + 5];
            vertexBuffer[vlen + 6] = vertices[j];
            vertexBuffer[vlen + 7] = vertices[j + 1];
        }

        this.verticesLength = before + verticesLength;

        let indicesArray = this.indexArray;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            indicesArray[i] = indices[j] + indexStart;
        this.indicesLength += indicesLength;

    }
    /**
     * @en Check if the mesh can append more vertices and indices.
     * @param verticesLength Number of vertices to be appended.
     * @param indicesLength Number of indices to be appended.
     * @returns True if the mesh can append, false otherwise.
     * @zh 检查网格是否能够添加更多的顶点和索引。
     * @param verticesLength 要添加的顶点数量。
     * @param indicesLength 要添加的索引数量。
     * @returns 如果网格可以添加则返回 true，否则返回 false。
     */
    canAppend(verticesLength: number, indicesLength: number) {
        return this.verticesLength + verticesLength < SpineVirtualMesh.maxVertex * SpineVirtualMesh.vertexSize && this.indicesLength + indicesLength < SpineVirtualMesh.maxVertex * 3;

    }
    /**
     * @en Append vertices to the mesh.
     * @param vertices Array of vertex positions.
     * @param verticesLength Number of vertices to append.
     * @param indices Array of indices.
     * @param indicesLength Number of indices to append.
     * @param finalColor Color to apply to vertices.
     * @param uvs Array of UV coordinates.
     * @zh 向网格添加顶点。
     * @param vertices 顶点位置数组。
     * @param verticesLength 要添加的顶点数量。
     * @param indices 索引数组。
     * @param indicesLength 要添加的索引数量。
     * @param finalColor 应用于顶点的颜色。
     * @param uvs UV 坐标数组。
     */
    appendVertices(vertices: ArrayLike<number>, verticesLength: number, indices: number[], indicesLength: number, finalColor: spine.Color, uvs: ArrayLike<number>) {
        let vertexSize = SpineVirtualMesh.vertexSize;
        let indexStart = this.verticesLength / vertexSize;
        let vertexBuffer = this.vertexArray;

        let before = this.verticesLength;

        for (let u = 0, v = 0, n = verticesLength; v < n; v += vertexSize, u += 2) {
            let size = before + v;
            // vertexBuffer[size] =  vertices[v];
            // vertexBuffer[size + 1] = vertices[v + 1];
            // vertexBuffer[size + 2] = finalColor.r;
            // vertexBuffer[size + 3] = finalColor.g;
            // vertexBuffer[size + 4] = finalColor.b;
            // vertexBuffer[size + 5] = finalColor.a;
            // vertexBuffer[size + 6] = uvs[u];
            // vertexBuffer[size + 7] = uvs[u + 1];

            vertexBuffer[size] = uvs[u];
            vertexBuffer[size + 1] = uvs[u + 1];
            vertexBuffer[size + 2] = finalColor.r;
            vertexBuffer[size + 3] = finalColor.g;
            vertexBuffer[size + 4] = finalColor.b;
            vertexBuffer[size + 5] = finalColor.a;
            vertexBuffer[size + 6] = vertices[v];
            vertexBuffer[size + 7] = vertices[v + 1];
        }

        this.verticesLength = before + verticesLength;

        let indicesArray = this.indexArray;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            indicesArray[i] = indices[j] + indexStart;
        this.indicesLength += indicesLength;
    }

    /**
     * @en The vertex declaration for the mesh.
     * @zh 网格的顶点声明。
     */
    get vertexDeclarition(): VertexDeclaration {
        return SpineShaderInit.SpineNormalVertexDeclaration;
    }

}