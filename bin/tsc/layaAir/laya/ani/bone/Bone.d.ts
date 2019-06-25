import { Transform } from "././Transform";
import { Matrix } from "../../maths/Matrix";
/**
 * @private
 */
export declare class Bone {
    static ShowBones: any;
    name: string;
    root: Bone;
    parentBone: Bone;
    length: number;
    transform: Transform;
    resultTransform: Transform;
    resultMatrix: Matrix;
    inheritScale: boolean;
    inheritRotation: boolean;
    rotation: number;
    resultRotation: number;
    d: number;
    private _tempMatrix;
    private _children;
    private _sprite;
    constructor();
    setTempMatrix(matrix: Matrix): void;
    update(pMatrix?: Matrix): void;
    updateChild(): void;
    setRotation(rd: number): void;
    updateDraw(x: number, y: number): void;
    addChild(bone: Bone): void;
    findBone(boneName: string): Bone;
    localToWorld(local: number[]): void;
}
