import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Material } from "../../resource/Material";
import { SlotExtend } from "../SlotExtend";
import { SpineFastMaterialShaderInit } from "../material/SpineFastMaterialShaderInit";
import { SpineMeshBase } from "./SpineMeshBase";

export class SpinBone4Mesh extends SpineMeshBase {
    get vertexDeclarition(): VertexDeclaration {
        return SpineFastMaterialShaderInit.vertexDeclaration;
    }
    static vertexSize: number = 22;

    constructor(material: Material) {
        super(material);
        this.vertexArray = new Float32Array(SpineMeshBase.maxVertex * SpinBone4Mesh.vertexSize);
        this.indexArray = new Uint16Array(SpineMeshBase.maxVertex * 3);
    }
    appendSlot(slot: SlotExtend, getBoneId: (boneIndex: number) => number) {
        let vertexArray = this.vertexArray;
        let indexArray = this.indexArray;
        let offset = this.verticesLength;
        let offset2 = this.indicesLength;
        let vside = SpinBone4Mesh.vertexSize;
        let slotVertex = slot.vertexArray;
        let Slotindex = slot.indexArray;
        let uvs = slot.uvs;
        let size = offset / vside;
        for (let j = 0, n = Slotindex.length; j < n; j++) {
            indexArray[offset2] = Slotindex[j] + size;
            offset2++;
        }
        if (slot.stride == 2) {
            let boneid = getBoneId(slot.boneIndex);
            for (let j = 0, n = slotVertex.length; j < n; j += slot.stride) {
                ///////////uv
                vertexArray[offset] = uvs[j];
                vertexArray[offset + 1] = uvs[j + 1];
                ///////////color
                vertexArray[offset + 2] = 1;
                vertexArray[offset + 3] = 1;
                vertexArray[offset + 4] = 1;
                vertexArray[offset + 5] = 1;

                vertexArray[offset + 6] = slotVertex[j];
                vertexArray[offset + 7] = slotVertex[j + 1];
                vertexArray[offset + 8] = 1;
                vertexArray[offset + 9] = boneid;

                let leftsize = vside - 10;
                let ox = offset + 10;
                for (let z = 0; z < leftsize / 4; z++) {
                    vertexArray[ox + z * 4] = 0;
                    vertexArray[ox + z * 4 + 1] = 0;
                    vertexArray[ox + z * 4 + 2] = 0;
                    vertexArray[ox + z * 4 + 3] = 0;
                }
                offset += vside;
            }
        }
        else {
            for (let j = 0, uvid = 0, n = slotVertex.length; j < n; j += slot.stride, uvid += 2) {
                vertexArray[offset] = uvs[uvid];
                vertexArray[offset + 1] = uvs[uvid + 1];

                vertexArray[offset + 2] = 1;
                vertexArray[offset + 3] = 1;
                vertexArray[offset + 4] = 1;
                vertexArray[offset + 5] = 1;

                let leftsize = vside - 6;
                let ox = offset + 6;
                for (let z = 0; z < leftsize / 4; z++) {
                    vertexArray[ox + z * 4] = slotVertex[j + z * 4];
                    vertexArray[ox + z * 4 + 1] = slotVertex[j + z * 4 + 1];
                    vertexArray[ox + z * 4 + 2] = slotVertex[j + z * 4 + 2];
                    vertexArray[ox + z * 4 + 3] = getBoneId(slotVertex[j + z * 4 + 3]);
                }
                offset += vside;
            }
        }

        this.verticesLength = offset;
        this.indicesLength = offset2;
    }

    clone():SpinBone4Mesh{
        let rs=new SpinBone4Mesh(this.material.clone());
        this._cloneTo(rs);
        return rs;
    }
}