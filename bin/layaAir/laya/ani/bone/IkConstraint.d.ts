import { Bone } from "././Bone";
import { IkConstraintData } from "././IkConstraintData";
/**
 * @private
 */
export declare class IkConstraint {
    private _targetBone;
    private _bones;
    private _data;
    name: string;
    mix: number;
    bendDirection: number;
    isSpine: boolean;
    static radDeg: number;
    static degRad: number;
    private static _tempMatrix;
    constructor(data: IkConstraintData, bones: Bone[]);
    apply(): void;
    private _applyIk1;
    private _sp;
    private isDebug;
    updatePos(x: number, y: number): void;
    private _applyIk2;
    private _applyIk3;
}
