import { TfConstraintData } from "././TfConstraintData";
import { Bone } from "././Bone";
/**
     * @private
     */
export declare class TfConstraint {
    private _data;
    private _bones;
    target: Bone;
    rotateMix: number;
    translateMix: number;
    scaleMix: number;
    shearMix: number;
    private _temp;
    constructor(data: TfConstraintData, bones: Bone[]);
    apply(): void;
}
