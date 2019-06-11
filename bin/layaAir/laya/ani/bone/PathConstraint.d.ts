import { BoneSlot } from "././BoneSlot";
import { PathConstraintData } from "././PathConstraintData";
import { Bone } from "././Bone";
import { Graphics } from "laya/display/Graphics";
/**
 * @private
 * 路径作用器
 * 1，生成根据骨骼计算控制点
 * 2，根据控制点生成路径，并计算路径上的节点
 * 3，根据节点，重新调整骨骼位置
 */
export declare class PathConstraint {
    private static NONE;
    private static BEFORE;
    private static AFTER;
    target: BoneSlot;
    data: PathConstraintData;
    bones: Bone[];
    position: number;
    spacing: number;
    rotateMix: number;
    translateMix: number;
    private _debugKey;
    private _segments;
    private _curves;
    private _spaces;
    constructor(data: PathConstraintData, bones: Bone[]);
    /**
     * 计算骨骼在路径上的节点
     * @param	boneSlot
     * @param	boneMatrixArray
     * @param	graphics
     */
    apply(boneList: Bone[], graphics: Graphics): void;
    private static _tempMt;
    /**
     * 计算顶点的世界坐标
     * @param	boneSlot
     * @param	boneList
     * @param	start
     * @param	count
     * @param	worldVertices
     * @param	offset
     */
    computeWorldVertices2(boneSlot: BoneSlot, boneList: Bone[], start: number, count: number, worldVertices: number[], offset: number): void;
    /**
     * 计算路径上的节点
     * @param	boneSlot
     * @param	boneList
     * @param	graphics
     * @param	spacesCount
     * @param	tangents
     * @param	percentPosition
     * @param	percentSpacing
     * @return
     */
    private computeWorldPositions;
    private addBeforePosition;
    private addAfterPosition;
    private addCurvePosition;
}
