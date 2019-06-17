import { ISaveData } from "././ISaveData";
import { Matrix } from "../../../maths/Matrix";
import { Context } from "../../../resource/Context";
export declare class SaveTranslate implements ISaveData {
    private static POOL;
    _mat: Matrix;
    isSaveMark(): boolean;
    restore(context: Context): void;
    static save(context: Context): void;
}
