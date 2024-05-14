import { Material } from "../../resource/Material";
import { SpineMaterialShaderInit } from "../material/SpineMaterialShaderInit";
import { SpineMeshBase } from "./SpineMeshBase";

export class SpineVirtualMesh extends SpineMeshBase{
    static vertexSize: number = 8;
    /**
     * Create a visual mesh
     * @param geo Geometry
     * @param material Material
     */
    constructor(material: Material) {
        super(material);
        this.vertexArray = new Float32Array(SpineMeshBase.maxVertex * SpineVirtualMesh.vertexSize);
        this.indexArray = new Uint16Array(SpineMeshBase.maxVertex * 3);
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

    get vertexDeclarition() {
        return SpineMaterialShaderInit.vertexDeclaration;
    }

}