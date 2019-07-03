import { ISaveData } from "./ISaveData";
import { Context } from "../../../resource/Context";
export declare class SaveTransform implements ISaveData {
    private static POOL;
    constructor();
    isSaveMark(): boolean;
    restore(context: Context): void;
    static save(context: Context): void;
}
