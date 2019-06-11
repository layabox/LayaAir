import { ISaveData } from "././ISaveData";
import { Matrix } from "../../../maths/Matrix";
import { Context } from "../../../resource/Context";
export declare class SaveTransform implements ISaveData {
    private static POOL;
    _savematrix: Matrix;
    _matrix: Matrix;
    constructor();
    isSaveMark(): boolean;
    restore(context: Context): void;
    static save(context: Context): void;
}
