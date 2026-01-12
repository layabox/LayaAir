import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { AttachmentParse } from "../optimize/AttachmentParse";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";

/**
 * @en Shared bone mapping registry for a Spine skeleton.
 * Maintains a unified mapping of bone indices to IDs across all VBCreators of a SpineTemplet.
 * @zh Spine骨架的共享骨骼映射注册表。
 * 在一个SpineTemplet的所有VBCreator之间维护统一的骨骼索引到ID的映射。
 */
export class SpineBoneRegistry {
    /**
     * @en Current maximum bone ID assigned.
     * @zh 当前分配的最大骨骼ID。
     */
    private _nextBoneId: number = 0;

    /**
     * @en Map of bone index to assigned bone ID.
     * @zh 骨骼索引到分配的骨骼ID的映射。
     */
    private _boneIndexToId: Map<number, number>;

    /**
     * @en Flattened array storing [boneId, boneIndex, boneId, boneIndex, ...] pairs.
     * @zh 扁平化数组，存储 [骨骼ID, 骨骼索引, 骨骼ID, 骨骼索引, ...] 对。
     */
    private _boneIdIndexPairs: number[];

    constructor() {
        this._boneIndexToId = new Map();
        this._boneIdIndexPairs = [];
    }

    /**
     * @en Get or register a bone ID for the given bone index.
     * If the bone index hasn't been registered, assigns a new ID.
     * @param boneIndex The bone index from spine skeleton.
     * @returns The assigned bone ID.
     * @zh 获取或注册给定骨骼索引的骨骼ID。
     * 如果骨骼索引尚未注册，则分配一个新的ID。
     * @param boneIndex 来自spine骨架的骨骼索引。
     * @returns 分配的骨骼ID。
     */
    getOrRegisterBoneId(boneIndex: number): number {
        let boneId = this._boneIndexToId.get(boneIndex);
        if (boneId === undefined) {
            boneId = this._nextBoneId;
            this._boneIndexToId.set(boneIndex, boneId);
            this._boneIdIndexPairs.push(boneId, boneIndex);
            this._nextBoneId++;
        }
        return boneId;
    }

    /**
     * @en Get the bone ID for a registered bone index.
     * @param boneIndex The bone index to look up.
     * @returns The bone ID if registered, undefined otherwise.
     * @zh 获取已注册骨骼索引的骨骼ID。
     * @param boneIndex 要查找的骨骼索引。
     * @returns 如果已注册则返回骨骼ID，否则返回undefined。
     */
    getBoneId(boneIndex: number): number | undefined {
        return this._boneIndexToId.get(boneIndex);
    }

    /**
     * @en Get total number of registered bones.
     * @returns The count of unique bones registered.
     * @zh 获取已注册的骨骼总数。
     * @returns 已注册的唯一骨骼数量。
     */
    get boneCount(): number {
        return this._nextBoneId;
    }

    /**
     * @en Get the flattened array of bone ID and index pairs.
     * Format: [boneId0, boneIndex0, boneId1, boneIndex1, ...]
     * @returns Array of bone ID-index pairs.
     * @zh 获取扁平化的骨骼ID和索引对数组。
     * 格式：[骨骼ID0, 骨骼索引0, 骨骼ID1, 骨骼索引1, ...]
     * @returns 骨骼ID-索引对数组。
     */
    get boneIdIndexPairs(): number[] {
        return this._boneIdIndexPairs;
    }

    /**
     * @en Get the map of bone index to bone ID.
     * @returns Map from bone index to bone ID.
     * @zh 获取骨骼索引到骨骼ID的映射。
     * @returns 从骨骼索引到骨骼ID的映射。
     */
    get boneIndexToIdMap(): Map<number, number> {
        return this._boneIndexToId;
    }

    /**
     * @en Clear all registered bone data.
     * @zh 清除所有已注册的骨骼数据。
     */
    clear(): void {
        this._nextBoneId = 0;
        this._boneIndexToId.clear();
        this._boneIdIndexPairs.length = 0;
    }
}

/**
 * @en Abstract class for creating vertex buffers in a spine skeleton animation system.
 * @zh 用于在spine骨骼动画系统中创建顶点缓冲区的抽象类。
 * @blueprintIgnore
 */
export abstract class VBCreator{
    /**
     * @en Shared bone registry for managing bone index to ID mappings across all VBCreators of a SpineTemplet.
     * @zh 共享骨骼注册表，用于管理一个SpineTemplet的所有VBCreator之间的骨骼索引到ID映射。
     */
    boneRegistry: SpineBoneRegistry;

    /**
     * @en Local map of bone index to bone ID used by this VBCreator. (Subset of boneRegistry)
     * @zh 此VBCreator使用的骨骼索引到骨骼ID的本地映射。(boneRegistry的子集)
     */
    localBoneIndexToId: Map<number, number>;

    /**
     * @en Local array of bone ID-index pairs used by this VBCreator.
     * Format: [boneId, boneIndex, boneId, boneIndex, ...]
     * @zh 此VBCreator使用的骨骼ID-索引对的本地数组。
     * 格式：[骨骼ID, 骨骼索引, 骨骼ID, 骨骼索引, ...]
     */
    localBoneIdIndexPairs: number[];

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
    /**
     * @en The Max Length of the vertex buffer.
     * @zh 顶点缓冲区的最大长度。
     */
    maxVertexCount: number;
    /**
     * @en Map of slot ID to attachment position data.
     * @zh 插槽ID到附件位置数据的映射。
     */
    slotVBMap: Map<number, Map<string, TAttamentPos>>;

    /** @internal */
    _vertexSize = 0;

    /** @internal 没有骨骼的顶点数 */
    _baseVtxCount: number = 6;

    _boneVtxCount: number = 4;

    /** @internal TODO 双顶点色模式 */
    twoColorTint: boolean = false;


    private _vertexDeclaration: VertexDeclaration;

    /**
     * @en Vertex flag string defining the vertex format.
     * @zh 定义顶点格式的顶点标志字符串。
     */
    vertexFlag: string;

    constructor(vertexFlag: string, maxVertexCount: number = 0, auto: boolean = true, boneRegistry?: SpineBoneRegistry) {
        this.maxVertexCount = maxVertexCount;
        this.vertexFlag = vertexFlag;

        // Use provided bone registry or create a new one
        this.boneRegistry = boneRegistry || new SpineBoneRegistry();
        this.localBoneIndexToId = new Map();
        this.localBoneIdIndexPairs = [];
        this.slotVBMap = new Map();
        this.vbLength = 0;

        if (auto) {
            this._vertexDeclaration = SpineShaderInit.getVertexDeclaration(this.vertexFlag);
            this.twoColorTint = vertexFlag.indexOf("COLOR2") != -1;
            if (this.twoColorTint) this._baseVtxCount += 4;
            this._vertexSize = this._vertexDeclaration.vertexStride / 4;
            this._boneVtxCount = this._vertexSize - this._baseVtxCount;
            this._updateBuffer();
        }
    }

    /**
     * @en set vertex buffer length.
     * @param maxVertexCount The Max length of Vertex count.
     * @zh 设置顶点缓冲长度。
     * @param maxVertexCount 顶点缓存区最大个数。
     */
    setBufferLength(maxVertexCount: number) {
        if (maxVertexCount <= this.maxVertexCount) return;
        this.maxVertexCount = maxVertexCount;
        this._updateBuffer();
    }

    protected _updateBuffer() {
        let oldbuffer = this.vb;
        this.vb = new Float32Array(this.maxVertexCount * this.vertexSize);
        if (oldbuffer) this.vb.set(oldbuffer);
    }

    get vertexSize(): number {
        return this._vertexSize;
    }

    get vertexDeclaration(): VertexDeclaration {
        return this._vertexDeclaration;
    }

    abstract appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, creator: VBCreator): number;

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
     * @en Get or register the bone ID for a given bone index.
     * Registers the bone in both the shared registry and local tracking.
     * @param boneIndex Bone index from spine skeleton.
     * @returns Bone ID.
     * @zh 获取或注册给定骨骼索引的骨骼ID。
     * 在共享注册表和本地跟踪中都注册该骨骼。
     * @param boneIndex 来自spine骨架的骨骼索引。
     * @returns 骨骼ID。
     */
    getBoneId(boneIndex: number): number {
        let id = this.localBoneIndexToId.get(boneIndex);
        if (id !== undefined) {
            return id;
        }

        id = this.boneRegistry.getOrRegisterBoneId(boneIndex);

        this.localBoneIndexToId.set(boneIndex, id);
        this.localBoneIdIndexPairs.push(id, boneIndex);

        return id;
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
        if (!attach.vertexCount) return offset;

        if (offset + attach.vertexCount >= this.maxVertexCount) {//长度超标
            this.setBufferLength(offset + attach.vertexCount);
        }

        this.vbLength = this.appendVertexArray(attach, this.vb, this.vbLength, this);
        return offset;
    }
    /**
     * @en Reset the vertex buffer.
     * @param attach Attachment parse data.
     * @zh 重置顶点缓冲区。
     * @param attach 附件解析数据。
     */
    resetVB(attach: AttachmentParse) {
        if (attach.isPath) {
            return;
        }
        let pos = this.slotVBMap.get(attach.slotId)?.get(attach.attachment);
        if (pos) {
            this.appendVertexArray(attach, this.vb, pos.offset * this.vertexSize, this);
        }
    }

    _cloneTo(target: VBCreator) {
        target.vb = new Float32Array(this.vb);
        target.vbLength = this.vbLength;

        target.boneRegistry = this.boneRegistry;

        target.localBoneIndexToId = new Map(this.localBoneIndexToId);
        target.localBoneIdIndexPairs = this.localBoneIdIndexPairs.slice();

        target._vertexDeclaration = this._vertexDeclaration;
        target._vertexSize = this._vertexSize;
        target.twoColorTint = this.twoColorTint;
        target._baseVtxCount = this._baseVtxCount;
        target._boneVtxCount = this._boneVtxCount;
        target.vertexFlag = this.vertexFlag;

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
        return new VBBoneCreator(this.vertexFlag, this.maxVertexCount, false, this.boneRegistry);
    }

    /**
     * @en Appends vertex array data for an attachment.
     * @param attachmentParse The attachment parse data.
     * @param vertexArray The vertex array to append to.
     * @param offset The current offset in the vertex array.
     * @param creator The creator.
     * @zh 为附件追加顶点数组数据。
     * @param attachmentParse 附件解析数据。
     * @param vertexArray 要追加到的顶点数组。
     * @param offset 顶点数组中的当前偏移量。
     * @param creator 创建器。
     */
    appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, creator: VBCreator) {
        if (!attachmentParse.attachment) {
            creator.getBoneId(attachmentParse.boneIndex);
            return offset;
        }
        let vside = this.vertexSize;
        let slotVertex = attachmentParse.vertexArray;
        let uvs = attachmentParse.uvs;
        let color = attachmentParse.color;
        let c1r: number = color.r, c1g: number = color.g, c1b: number = color.b, c1a: number = color.a;
        let boneNum = this._boneVtxCount / 4;

        let color2 = attachmentParse.darkColor;
        let c2r: number = 0, c2g: number = 0, c2b: number = 0, c2a: number = 1;
        if (color2) {
            c2r = color2.r;
            c2g = color2.g;
            c2b = color2.b;
            c2a = color2.a;
        }

        if (attachmentParse.stride == 2) {
            let boneid = creator.getBoneId(attachmentParse.boneIndex);
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                ///////////uv
                vertexArray[offset] = uvs[j];
                vertexArray[offset + 1] = uvs[j + 1];
                ///////////color
                vertexArray[offset + 2] = c1r;
                vertexArray[offset + 3] = c1g;
                vertexArray[offset + 4] = c1b;
                vertexArray[offset + 5] = c1a;

                vertexArray[offset + 6] = slotVertex[j];
                vertexArray[offset + 7] = slotVertex[j + 1];
                vertexArray[offset + 8] = 1;
                vertexArray[offset + 9] = boneid;

                let ox = offset + 10;
                for (let z = 0, len = boneNum - 1; z < len; z++) {
                    let vOffset = ox + z * 4;
                    vertexArray[vOffset] = 0;
                    vertexArray[vOffset + 1] = 0;
                    vertexArray[vOffset + 2] = 0;
                    vertexArray[vOffset + 3] = 0;
                }

                //////// color2
                if (this.twoColorTint) {
                    let tColorOffset = offset + 6 + this._boneVtxCount;
                    vertexArray[tColorOffset] = c2r;
                    vertexArray[tColorOffset + 1] = c2g;
                    vertexArray[tColorOffset + 2] = c2b;
                    vertexArray[tColorOffset + 3] = c2a;
                }
                offset += vside;
            }
        }
        else {
            for (let j = 0, uvid = 0, n = slotVertex.length; j < n; j += attachmentParse.stride, uvid += 2) {
                vertexArray[offset] = uvs[uvid];
                vertexArray[offset + 1] = uvs[uvid + 1];

                vertexArray[offset + 2] = c1r;
                vertexArray[offset + 3] = c1g;
                vertexArray[offset + 4] = c1b;
                vertexArray[offset + 5] = c1a;

                let ox = offset + 6;
                for (let z = 0; z < boneNum; z++) {
                    let vOffset = ox + z * 4;
                    let oOffset = j + z * 4;
                    vertexArray[vOffset] = slotVertex[oOffset];
                    vertexArray[vOffset + 1] = slotVertex[oOffset + 1];
                    vertexArray[vOffset + 2] = slotVertex[oOffset + 2];
                    vertexArray[vOffset + 3] = creator.getBoneId(slotVertex[oOffset + 3]);
                }

                if (this.twoColorTint) {
                    let tColorOffset = ox + this._boneVtxCount;
                    vertexArray[tColorOffset] = c2r;
                    vertexArray[tColorOffset + 1] = c2g;
                    vertexArray[tColorOffset + 2] = c2b;
                    vertexArray[tColorOffset + 3] = c2a;
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
            let attchment = attachmentParse.sourceData as spine.MeshAttachment;
            let bones = attchment.bones;
            let vertexCount = attachmentParse.vertexCount;
            let boneNum = this._boneVtxCount / 4;
            //bones [len, boneIndex, boneIndex.... , len , boneIndex, boneIndex....];
            //deform [deformX, deformY, deformX, deformY....];
            let f = 0, v = 0;
            for (let w = 0; w < vertexCount; w++) {
                let len = bones[v++];
                // slotVertex Offset : matrix4 [x , y , weight , boneIndex]
                let slotOffset = w * this._boneVtxCount;
                // vertex Offset : uv 2 color 4 matrix[x , y , weight , boneIndex]
                let vertexOffset = offset + w * vside + 6;

                for (let i = 0; i < len; i++) {
                    if (i >= boneNum) break;

                    let deformOffset = f + i * 2;
                    let slotIndex = slotOffset + i * 4;
                    let boneOffset = vertexOffset + i * 4;
                    out[boneOffset] = slotVertex[slotIndex] + deform[deformOffset];
                    out[boneOffset + 1] = slotVertex[slotIndex + 1] + deform[deformOffset + 1];
                }

                v += len;
                f += 2 * len;
            }
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
        return new VBRigBodyCreator(this.vertexFlag, this.maxVertexCount, false, this.boneRegistry);
    }

    /**
     * @en Appends vertex array data for an attachment.
     * @param attachmentParse The attachment parse data.
     * @param vertexArray The vertex array to append to.
     * @param offset The current offset in the vertex array.
     * @param creator The creator.
     * @zh 为附件追加顶点数组数据。
     * @param attachmentParse 附件解析数据。
     * @param vertexArray 要追加到的顶点数组。
     * @param offset 顶点数组中的当前偏移量。
     * @param creator 创建器。
     */
    appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, creator: VBCreator) {
        let slotVertex = attachmentParse.vertexArray;
        let uvs = attachmentParse.uvs;
        let color = attachmentParse.color;
        let color2 = attachmentParse.darkColor;
        let vside = this.vertexSize;
        let c1r: number = color.r, c1g: number = color.g, c1b: number = color.b, c1a: number = color.a;
        let c2r: number = 0, c2g: number = 0, c2b: number = 0, c2a: number = 1;
        if (color2) {
            c2r = color2.r;
            c2g = color2.g;
            c2b = color2.b;
            c2a = color2.a;
        }
        if (attachmentParse.stride == 2) {
            let boneid = creator.getBoneId(attachmentParse.boneIndex);
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                ///////////uv
                vertexArray[offset + 0] = uvs[j];
                vertexArray[offset + 1] = uvs[j + 1];
                ///////////color
                vertexArray[offset + 2] = c1r;
                vertexArray[offset + 3] = c1g;
                vertexArray[offset + 4] = c1b;
                vertexArray[offset + 5] = c1a;

                vertexArray[offset + 6] = slotVertex[j];
                vertexArray[offset + 7] = slotVertex[j + 1];

                // vertexArray[offset + 8] = boneid;

                if (this.twoColorTint) {
                    let tColorOffset = offset + 8;
                    vertexArray[tColorOffset] = c2r;
                    vertexArray[tColorOffset + 1] = c2g;
                    vertexArray[tColorOffset + 2] = c2b;
                    vertexArray[tColorOffset + 3] = c2a;
                }

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