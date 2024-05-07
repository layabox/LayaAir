import { SpinBone4Mesh } from "../mesh/SpineBone4Mesh";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { SlotUtils } from "./SlotUtils";
import { IGetBone } from "./interface/IGetBone";

export class VBCreator implements IGetBone {
    mapIndex: Map<number, number>;
    vb: Float32Array;
    vbLength: number;
    slotVBMap: Map<number, Map<string, number>>;

    private boneMaxId: number = 0;
    constructor() {
        this.mapIndex = new Map();
        this.slotVBMap = new Map();
        this.vb = new Float32Array(SpineMeshBase.maxVertex * SpinBone4Mesh.vertexSize);
        this.vbLength = 0;
    }
    appendAndCreateIB(attach: AttachmentParse) {
        //this.mesh.appendSlot(slot);
        this.appendVB(attach);
    }

    getBoneId(boneIndex: number) {
        let id = this.mapIndex.get(boneIndex);
        if (id == undefined) {
            id = this.boneMaxId;
            this.mapIndex.set(boneIndex, id);
            this.boneMaxId++;
        }
        return id;
    }

    appendVB(attach: AttachmentParse) {
        let offset;
        let map = this.slotVBMap.get(attach.slotId);
        if (map) {
            let offset = map.get(attach.attachment);
            if (offset != undefined) {
                return offset;
            }
        }
        else {
            map = new Map();
            this.slotVBMap.set(attach.slotId, map);
        }
        offset = this.vbLength / SpinBone4Mesh.vertexSize;
        map.set(attach.attachment, offset);
        this.vbLength = SlotUtils.appendVertexArray(attach, this.vb, this.vbLength, this);
        return offset;
    }

    createIB(attachs: AttachmentParse[], ibCreator: IBCreator, order?: number[]) {
        let offset = 0;
        let slotVBMap = this.slotVBMap;
        let ib = ibCreator.ib;
        let drawOrder;
        let getAttach: (value: any) => AttachmentParse;
        if (order) {
            drawOrder = order;
            getAttach = function (value: any) {
                return attachs[value];
            }
        }
        else {
            drawOrder = attachs;
            getAttach = function (value: any) {
                return value;
            }
        }
        let outRenderData = new MultiRenderData();
        let texture;
        let blend;
        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let attach = getAttach(drawOrder[i]);
            if (attach.attachment) {
                let needAdd = false;
                if (texture != attach.texture) {
                    texture = attach.texture;
                    needAdd = true;
                }
                if (blend != attach.blendMode) {
                    blend = attach.blendMode;
                    needAdd = true;
                }
                if (needAdd) {
                    if (outRenderData.currentData) {
                        outRenderData.endData(offset);
                    }
                    outRenderData.addData(attach.texture, attach.blendMode, offset, 0);
                }
                let size = slotVBMap.get(attach.slotId).get(attach.attachment);
                offset = SlotUtils.appendIndexArray(attach, ib, size, offset);
            }
        }
        if (texture) {
            outRenderData.endData(offset);
        }
        ibCreator.outRenderData = outRenderData;
        ibCreator.ibLength = offset;
    }

    updateBone(bones: spine.Bone[], boneMat: Float32Array) {
        this.mapIndex.forEach((value, key) => {
            let offset = value * 8;
            let bone = bones[key];
            boneMat[offset] = bone.a;
            boneMat[offset + 1] = bone.b;
            boneMat[offset + 2] = bone.worldX;
            boneMat[offset + 3] = 0;
            boneMat[offset + 4] = bone.c;
            boneMat[offset + 5] = bone.d;
            boneMat[offset + 6] = bone.worldY;
            boneMat[offset + 7] = 0;
        });
    }

    clone() {
        let rs = new VBCreator();
        rs.vb = new Float32Array(this.vb);
        rs.vbLength = this.vbLength;
        rs.mapIndex = new Map(this.mapIndex);
        rs.boneMaxId = this.boneMaxId;
        this.slotVBMap.forEach((value, key) => {
            rs.slotVBMap.set(key, new Map(value));
        });
        //rs.slotVBMap=new Map(this.slotVBMap);
        return rs;
    }
}