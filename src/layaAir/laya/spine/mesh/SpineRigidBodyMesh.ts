import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Material } from "../../resource/Material";

import { SpineRBMaterialShaderInit } from "../material/SpineRBMaterialShaderInit";
import { ISlotExtend } from "../slot/ISlotExtend";
import { ISpineMesh } from "./ISpineMesh";
import { SpineMeshBase } from "./SpineMeshBase";

export class SpineRigidBodyMesh extends SpineMeshBase implements ISpineMesh {
    get vertexDeclarition(): VertexDeclaration {
        return SpineRBMaterialShaderInit.vertexDeclaration;
    }
    static vertexSize: number = 9;

    constructor(material: Material) {
        super(material);
        this.vertexArray = new Float32Array(SpineMeshBase.maxVertex * SpineRigidBodyMesh.vertexSize);
        this.indexArray = new Uint16Array(SpineMeshBase.maxVertex * 3);
    }
    appendSlot(slot: ISlotExtend, getBoneId: (boneIndex: number) => number) {
        let vertexArray = this.vertexArray;
        let indexArray = this.indexArray;
        let offset = this.verticesLength;
        let offset2 = this.indicesLength;
        let vside = SpineRigidBodyMesh.vertexSize;
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
                vertexArray[offset + 0] = slotVertex[j];
                vertexArray[offset + 1] = slotVertex[j + 1];
                ///////////color
                vertexArray[offset + 2] = 1;
                vertexArray[offset + 3] = 1;
                vertexArray[offset + 4] = 1;
                vertexArray[offset + 5] = 1;

                ///////////uv
                vertexArray[offset + 6] = uvs[j];
                vertexArray[offset + 7] = uvs[j + 1];
                vertexArray[offset + 8] = boneid;
                offset += vside;
            }
        }

        this.verticesLength = offset;
        this.indicesLength = offset2;
    }

    clone(): SpineRigidBodyMesh {
        let rs = new SpineRigidBodyMesh(this.material.clone());
        this._cloneTo(rs);
        return rs;
    }
}