import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { SlotUtils } from "./SlotUtils";
import { IGetBone } from "./interface/IGetBone";

export abstract class VBCreator implements IGetBone {
    mapIndex: Map<number, number>;
    boneArray: number[];
    vb: Float32Array;
    vbLength: number;
    slotVBMap: Map<number, Map<string, TAttamentPos>>;

    boneMat: Float32Array;

    private boneMaxId: number = 0;
    constructor(autoNew: boolean = true) {
        this.init(autoNew);
    }

    init(autoNew: boolean) {
        this.mapIndex = new Map();
        this.slotVBMap = new Map();
        this.boneArray = [];
        if (autoNew) {
            this.vb = new Float32Array(SpineMeshBase.maxVertex * this.vertexSize);
        }
        this.vbLength = 0;
    }

    abstract get vertexSize(): number;

    abstract appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, boneGet: IGetBone): number;


    appendAndCreateIB(attach: AttachmentParse) {
        //this.mesh.appendSlot(slot);
        this.appendVB(attach);
    }

    getBoneId(boneIndex: number) {
        let id = this.mapIndex.get(boneIndex);
        if (id == undefined) {
            id = this.boneMaxId;
            this.mapIndex.set(boneIndex, id);
            this.boneArray.push(id, boneIndex);
            this.boneMaxId++;
        }
        return id;
    }

    initBoneMat() {
        this.boneMat = new Float32Array(8 * this.mapIndex.size);
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
        offset = this.vbLength / this.vertexSize;
        map.set(attach.attachment, { offset: offset, attachment: attach });
        this.vbLength = this.appendVertexArray(attach, this.vb, this.vbLength, this);
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
                let attachPos = slotVBMap.get(attach.slotId).get(attach.attachment);
                offset = SlotUtils.appendIndexArray(attach, ib, attachPos.offset, offset);
            }
        }
        if (texture) {
            outRenderData.endData(offset);
        }
        ibCreator.outRenderData = outRenderData;
        ibCreator.ibLength = offset;
    }

    updateBone(bones: spine.Bone[]) {
        let boneMat: Float32Array = this.boneMat;
        let boneArray = this.boneArray;
        for (let i = 0, n = boneArray.length; i < n; i += 2) {
            let offset = boneArray[i] * 8;
            let bone = bones[boneArray[i + 1]];
            boneMat[offset] = bone.a;
            boneMat[offset + 1] = bone.b;
            boneMat[offset + 2] = bone.worldX;
            boneMat[offset + 3] = 0;
            boneMat[offset + 4] = bone.c;
            boneMat[offset + 5] = bone.d;
            boneMat[offset + 6] = bone.worldY;
            boneMat[offset + 7] = 0;
        }
    }

    _cloneTo(target: VBCreator) {
        target.vb = new Float32Array(this.vb);
        target.vbLength = this.vbLength;
        target.mapIndex = new Map(this.mapIndex);
        target.boneMaxId = this.boneMaxId;
        target.boneArray = this.boneArray.slice();
        this.slotVBMap.forEach((value, key) => {
            target.slotVBMap.set(key, new Map(value));
        });
    }

    abstract _create(): VBCreator;

    clone() {
        let rs = this._create();
        this._cloneTo(rs);
        return rs;
    }
}

export class VBBoneCreator extends VBCreator {
    _create(): VBCreator {
        return new VBBoneCreator(false);
    }

    get vertexSize(): number {
        return 22;
    }

    appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, boneGet: IGetBone) {
        if (!attachmentParse.attachment) return offset;
        let vside = this.vertexSize;
        let slotVertex = attachmentParse.vertexArray;
        let uvs = attachmentParse.uvs;
        let color = attachmentParse.color;
        if (attachmentParse.stride == 2) {
            let boneid = boneGet.getBoneId(attachmentParse.boneIndex);
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                ///////////uv
                vertexArray[offset] = uvs[j];
                vertexArray[offset + 1] = uvs[j + 1];
                ///////////color
                vertexArray[offset + 2] = color.r;
                vertexArray[offset + 3] = color.g;
                vertexArray[offset + 4] = color.b;
                vertexArray[offset + 5] = color.a;

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
            for (let j = 0, uvid = 0, n = slotVertex.length; j < n; j += attachmentParse.stride, uvid += 2) {
                vertexArray[offset] = uvs[uvid];
                vertexArray[offset + 1] = uvs[uvid + 1];

                vertexArray[offset + 2] = color.r;
                vertexArray[offset + 3] = color.g;
                vertexArray[offset + 4] = color.b;
                vertexArray[offset + 5] = color.a;

                let leftsize = vside - 6;
                let ox = offset + 6;
                for (let z = 0; z < leftsize / 4; z++) {
                    vertexArray[ox + z * 4] = slotVertex[j + z * 4];
                    vertexArray[ox + z * 4 + 1] = slotVertex[j + z * 4 + 1];
                    vertexArray[ox + z * 4 + 2] = slotVertex[j + z * 4 + 2];
                    vertexArray[ox + z * 4 + 3] = boneGet.getBoneId(slotVertex[j + z * 4 + 3]);
                }
                offset += vside;
            }
        }
        return offset;
    }

}

export class VBRigBodyCreator extends VBCreator {
    _create(): VBCreator {
        return new VBRigBodyCreator(false);
    }
    get vertexSize(): number {
        return 9;
    }
    appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, boneGet: IGetBone) {
        let slotVertex = attachmentParse.vertexArray;
        let uvs = attachmentParse.uvs;
        let color = attachmentParse.color;
        let vside = this.vertexSize;
        if (attachmentParse.stride == 2) {
            let boneid = boneGet.getBoneId(attachmentParse.boneIndex);
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                vertexArray[offset + 0] = slotVertex[j];
                vertexArray[offset + 1] = slotVertex[j + 1];
                ///////////color
                vertexArray[offset + 2] = color.r;
                vertexArray[offset + 3] = color.g;
                vertexArray[offset + 4] = color.b;
                vertexArray[offset + 5] = color.a;

                ///////////uv
                vertexArray[offset + 6] = uvs[j];
                vertexArray[offset + 7] = uvs[j + 1];
                vertexArray[offset + 8] = boneid;
                offset += vside;
            }
        }
        return offset;
    }
}

export type TAttamentPos = {
    offset: number;
    attachment: AttachmentParse;
}