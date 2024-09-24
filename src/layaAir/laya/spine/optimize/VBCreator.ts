import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { SpineMeshUtils } from "../mesh/SpineMeshUtils";
import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { SlotUtils } from "./SlotUtils";
import { IGetBone } from "./interface/IGetBone";

/**
 * @en Abstract class for creating vertex buffers in a spine skeleton animation system.
 * @zh 用于在spine骨骼动画系统中创建顶点缓冲区的抽象类。
 */
export abstract class VBCreator implements IGetBone {
    /**
     * @en Map of bone index to bone ID.
     * @zh 骨骼索引到骨骼ID的映射。
     */
    mapIndex: Map<number, number>;
    /**
     * @en Array of bone IDs and indices.
     * @zh 骨骼ID和索引的数组。
     */
    boneArray: number[];
    /**
     * @en Vertex buffer data.
     * @zh 顶点缓冲区数据。
     */
    vb: Float32Array;
    /**
     * @en Length of the vertex buffer.
     * @zh 顶点缓冲区的长度。
     */
    vbLength: number;
    maxVertexCount:number;
    /**
     * @en Map of slot ID to attachment position data.
     * @zh 插槽ID到附件位置数据的映射。
     */
    slotVBMap: Map<number, Map<string, TAttamentPos>>;

    /**
     * @en Bone matrix data.
     * @zh 骨骼矩阵数据。
     */
    boneMat: Float32Array;
    _vertexSize = 0;

    twoColorTint:boolean = false;

    private boneMaxId: number = 0;

    _vertexDeclaration:VertexDeclaration;

    vertexFlag:string;

    constructor( maxVertexCount :number , vertexFlag:string , auto: boolean = true ) {
        this.maxVertexCount = maxVertexCount;
        this.vertexFlag = vertexFlag;

        this.mapIndex = new Map();
        this.slotVBMap = new Map();
        this.boneArray = [];
        this.vbLength = 0;

        if (auto) {
            this._vertexDeclaration = SpineMeshUtils.getVertexDeclaration(this.vertexFlag);
            this.twoColorTint = vertexFlag.indexOf("COLOR2") != -1;
            this._vertexSize = this._vertexDeclaration.vertexStride / 4;
            this.vb = new Float32Array(this.maxVertexCount * this.vertexSize);
        }
    }

    get vertexSize(): number{
        return this._vertexSize;
    }

    get vertexDeclaration():VertexDeclaration{
        return this._vertexDeclaration;
    }

    abstract appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, boneGet: IGetBone): number;

    /**
     * @en Append deform data to the output array.
     * @param attachmentParse Attachment parse data.
     * @param deform Deform data array.
     * @param offset Offset in the output array.
     * @param out Output array.
     * @zh 将变形数据追加到输出数组。
     * @param attachmentParse 附件解析数据。
     * @param deform 变形数据数组。
     * @param offset 输出数组中的偏移量。
     * @param out 输出数组。
     */
    abstract appendDeform(attachmentParse: AttachmentParse, deform: Array<number>, offset: number, out: Float32Array): void;

    /**
     * @en Append vertex buffer and create index buffer for an attachment.
     * @param attach Attachment parse data.
     * @zh 为附件追加顶点缓冲区并创建索引缓冲区。
     * @param attach 附件解析数据。
     */
    appendAndCreateIB(attach: AttachmentParse) {
        this.appendVB(attach);
    }

    /**
     * @en Get the bone ID for a given bone index.
     * @param boneIndex Bone index.
     * @returns Bone ID.
     * @zh 获取给定骨骼索引的骨骼ID。
     * @param boneIndex 骨骼索引。
     * @returns 骨骼ID。
     */
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

    /**
     * @en Initialize the bone matrix.
     * @zh 初始化骨骼矩阵。
     */
    initBoneMat() {
        this.boneMat = new Float32Array(8 * this.mapIndex.size);
    }

    /**
     * @en Append vertex buffer data for an attachment.
     * @param attach Attachment parse data.
     * @returns Offset in the vertex buffer.
     * @zh 为附件追加顶点缓冲区数据。
     * @param attach 附件解析数据。
     * @returns 顶点缓冲区中的偏移量。
     */
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
        if (attach.isPath) return offset;
        this.vbLength = this.appendVertexArray(attach, this.vb, this.vbLength, this);
        return offset;
    }

    /**
     * @en Create index buffer for attachments.
     * @param attachs Array of attachment parse data.
     * @param ibCreator Index buffer creator.
     * @param order Optional draw order array.
     * @zh 为附件创建索引缓冲区。
     * @param attachs 附件解析数据数组。
     * @param ibCreator 索引缓冲区创建器。
     * @param order 可选的绘制顺序数组。
     */
    createIB(attachs: AttachmentParse[], ibCreator: IBCreator, order?: number[]) {
        let offset = 0;
        let slotVBMap = this.slotVBMap;
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

        let ib = ibCreator.ib;
        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let attach = getAttach(drawOrder[i]);
            if (attach.attachment && !attach.isPath) {
                let needAdd = false;
                if (texture != attach.textureName) {
                    texture = attach.textureName;
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
                    outRenderData.addData(attach.textureName, attach.blendMode, offset, 0);
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

    /**
     * @en Update bone matrices.
     * @param bones Array of bones.
     * @param boneMat Bone matrix array.
     * @zh 更新骨骼矩阵。
     * @param bones 骨骼数组。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBone(bones: spine.Bone[], boneMat: Float32Array) {
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

    /**
     * @en Update bone cache.
     * @param boneFrames Array of bone frame data.
     * @param frames Frame number.
     * @param boneMat Bone matrix array.
     * @zh 更新骨骼缓存。
     * @param boneFrames 骨骼帧数据数组。
     * @param frames 帧数。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBoneCache(boneFrames: Float32Array[][], frames: number, boneMat: Float32Array) {
        let boneArray = this.boneArray;
        let floor = Math.floor(frames);
        let detal;
        if (floor == boneFrames.length - 1) { detal = 0; }
        else {
            detal = frames - floor;
        }
        let boneFrames1 = boneFrames[floor];
        let boneFrames2 = boneFrames[floor + 1];
        if (detal > 0.0001) {
            for (let i = 0, n = boneArray.length; i < n; i += 2) {
                let offset = boneArray[i] * 8;
                let boneFloatArray = boneFrames1[boneArray[i + 1]];
                let boneFloatArray2 = boneFrames2[boneArray[i + 1]];
                boneMat[offset] = boneFloatArray[0] + (boneFloatArray2[0] - boneFloatArray[0]) * detal;
                boneMat[offset + 1] = boneFloatArray[1] + (boneFloatArray2[1] - boneFloatArray[1]) * detal;
                boneMat[offset + 2] = boneFloatArray[2] + (boneFloatArray2[2] - boneFloatArray[2]) * detal;
                boneMat[offset + 3] = 0
                boneMat[offset + 4] = boneFloatArray[4] + (boneFloatArray2[4] - boneFloatArray[4]) * detal;
                boneMat[offset + 5] = boneFloatArray[5] + (boneFloatArray2[5] - boneFloatArray[5]) * detal;
                boneMat[offset + 6] = boneFloatArray[6] + (boneFloatArray2[6] - boneFloatArray[6]) * detal;
                boneMat[offset + 7] = 0;
            }
        }
        else {
            for (let i = 0, n = boneArray.length; i < n; i += 2) {
                let offset = boneArray[i] * 8;
                let bone = boneFrames1[boneArray[i + 1]];
                boneMat.set(bone, offset);
            }
        }
    }

    // _cloneBones(target:VBCreator){
    //     target.mapIndex = new Map(this.mapIndex);
    //     target.boneMaxId = this.boneMaxId;
    //     target.boneArray = this.boneArray.slice();
    // }

    _cloneTo(target: VBCreator) {
        target.vb = new Float32Array(this.vb);
        target.vbLength = this.vbLength;
        target.mapIndex = new Map(this.mapIndex);
        target.boneMaxId = this.boneMaxId;
        target.boneArray = this.boneArray.slice();
        target._vertexDeclaration = this._vertexDeclaration;
        target._vertexSize = this._vertexSize;
        target.twoColorTint = this.twoColorTint;

        this.slotVBMap.forEach((value, key) => {
            target.slotVBMap.set(key, new Map(value));
        });
    }

    abstract _create(): VBCreator;

    /**
     * @en Clone this VBCreator.
     * @zh 克隆此VBCreator。
     */
    clone() {
        let rs = this._create();
        this._cloneTo(rs);
        return rs;
    }
}

/**
 * @en VBBoneCreator class used to handle bone-specific vertex buffer creation.
 * @zh VBBoneCreator 类用于处理骨骼特定的顶点缓冲区创建。
 */
export class VBBoneCreator extends VBCreator {

    _create(): VBCreator {
        return new VBBoneCreator(this.maxVertexCount, this.vertexFlag , false);
    }

    /**
     * @en Appends vertex array data for an attachment.
     * @param attachmentParse The attachment parse data.
     * @param vertexArray The vertex array to append to.
     * @param offset The current offset in the vertex array.
     * @param boneGet The interface for getting bone IDs.
     * @zh 为附件追加顶点数组数据。
     * @param attachmentParse 附件解析数据。
     * @param vertexArray 要追加到的顶点数组。
     * @param offset 顶点数组中的当前偏移量。
     * @param boneGet 获取骨骼ID的接口。
     */
    appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, boneGet: IGetBone) {
        if (!attachmentParse.attachment) {
            boneGet.getBoneId(attachmentParse.boneIndex);
            return offset;
        }
        let vside = this.vertexSize;
        let slotVertex = attachmentParse.vertexArray;
        let uvs = attachmentParse.uvs;
        let color = attachmentParse.color;
        let color2 = attachmentParse.color;
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

    /**
     * @en Appends deform data to the output array.
     * @param attachmentParse The attachment parse data.
     * @param deform The deform data array.
     * @param offset The current offset in the output array.
     * @param out The output array to append to.
     * @zh 将变形数据追加到输出数组。
     * @param attachmentParse 附件解析数据。
     * @param deform 变形数据数组。
     * @param offset 输出数组中的当前偏移量。
     * @param out 要追加到的输出数组。
     */
    appendDeform(attachmentParse: AttachmentParse, deform: Array<number>, offset: number, out: Float32Array) {
        if (!attachmentParse.attachment) {
            return;
        }
        let vside = this.vertexSize;
        let slotVertex = attachmentParse.vertexArray;

        if (attachmentParse.stride == 2) {
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                out[offset + 6] = deform[j];
                out[offset + 7] = deform[j + 1];
                offset += vside;
            }
        }
        else {
            let f = 0;
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                let leftsize = vside - 6;
                let ox = offset + 6;
                for (let z = 0; z < leftsize / 4; z++) {
                    let slotOffset = j + z * 4;
                    if (slotVertex[slotOffset + 2]) {
                        let offset = ox + z * 4;
                        out[offset] = slotVertex[slotOffset] + deform[f];
                        out[offset + 1] = slotVertex[slotOffset + 1] + deform[f + 1];
                        f += 2;
                    }
                }
                offset += vside;
            }
            // console.log(f , deform.length);
        }
    }
}

/**
 * @en VBRigBodyCreator class used to handle rigid body specific vertex buffer creation.
 * @zh VBRigBodyCreator 类用于处理刚体特定的顶点缓冲区创建。
 */
export class VBRigBodyCreator extends VBCreator {
    /** @internal */
    _create(): VBCreator {
        return new VBRigBodyCreator(this.maxVertexCount , this.vertexFlag , false);
    }

    /**
     * @en Appends vertex array data for an attachment.
     * @param attachmentParse The attachment parse data.
     * @param vertexArray The vertex array to append to.
     * @param offset The current offset in the vertex array.
     * @param boneGet The interface for getting bone IDs.
     * @zh 为附件追加顶点数组数据。
     * @param attachmentParse 附件解析数据。
     * @param vertexArray 要追加到的顶点数组。
     * @param offset 顶点数组中的当前偏移量。
     * @param boneGet 获取骨骼ID的接口。
     */
    appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, boneGet: IGetBone) {
        let slotVertex = attachmentParse.vertexArray;
        let uvs = attachmentParse.uvs;
        let color = attachmentParse.color;
        let vside = this.vertexSize;
        if (attachmentParse.stride == 2) {
            let boneid = boneGet.getBoneId(attachmentParse.boneIndex);
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                vertexArray[offset + 6] = slotVertex[j];
                vertexArray[offset + 7] = slotVertex[j + 1];
                ///////////color
                vertexArray[offset + 2] = color.r;
                vertexArray[offset + 3] = color.g;
                vertexArray[offset + 4] = color.b;
                vertexArray[offset + 5] = color.a;

                ///////////uv
                vertexArray[offset + 0] = uvs[j];
                vertexArray[offset + 1] = uvs[j + 1];
                vertexArray[offset + 8] = boneid;
                offset += vside;
            }
        } else {

        }
        return offset;
    }

    /**
     * @en Appends deform data to the output array.
     * @param attachmentParse The attachment parse data.
     * @param deform The deform data array.
     * @param offset The current offset in the output array.
     * @param out The output array to append to.
     * @zh 将变形数据追加到输出数组。
     * @param attachmentParse 附件解析数据。
     * @param deform 变形数据数组。
     * @param offset 输出数组中的当前偏移量。
     * @param out 要追加到的输出数组。
     */
    appendDeform(attachmentParse: AttachmentParse, deform: Array<number>, offset: number, out: Float32Array): void {
        if (!attachmentParse.attachment) {
            return;
        }
        let vside = this.vertexSize;
        let slotVertex = attachmentParse.vertexArray;

        if (attachmentParse.stride == 2) {
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                out[offset + 6] = deform[j];
                out[offset + 7] = deform[j + 1];
                offset += vside;
            }
        }
    }
}

export type TAttamentPos = {
    offset: number;
    attachment: AttachmentParse;
}