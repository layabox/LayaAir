import { BoneSlot } from "././BoneSlot";
/**
     * @private
     */
export declare class DeformSlotDisplayData {
    boneSlot: BoneSlot;
    slotIndex: number;
    attachment: string;
    timeList: number[];
    vectices: any[][];
    tweenKeyList: boolean[];
    deformData: any[];
    frameIndex: number;
    constructor();
    private binarySearch1;
    apply(time: number, boneSlot: BoneSlot, alpha?: number): void;
}
