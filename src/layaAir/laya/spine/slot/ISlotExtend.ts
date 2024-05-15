export interface ISlotExtend {

    vertexArray: Float32Array;
    indexArray: Array<number>;
    uvs: spine.ArrayLike<number>;
    stride: number;
    boneIndex: number;
    init(slot: spine.Slot, vside: number):boolean;

}