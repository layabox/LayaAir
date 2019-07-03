import { Context } from "../../../resource/Context";
import { ISaveData } from "./ISaveData";
export declare class SaveMark implements ISaveData {
    private static POOL;
    constructor();
    isSaveMark(): boolean;
    restore(context: Context): void;
    static Create(context: Context): SaveMark;
}
