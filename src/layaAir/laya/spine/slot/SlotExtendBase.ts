import { Texture } from "../../resource/Texture";
import { ISlotExtend } from "./ISlotExtend";

export abstract class SlotExtendBase implements ISlotExtend{
    bone: spine.Bone;
    boneIndex: number;
    vertexArray: Float32Array;
    indexArray: Array<number>;
    uvs: spine.ArrayLike<number>;
    stride: number;
    texture: Texture;
    attchment: spine.Attachment;

    abstract init(slot: spine.Slot, vside: number): boolean;
}