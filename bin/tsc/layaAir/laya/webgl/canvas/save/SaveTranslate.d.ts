import { ISaveData } from "./ISaveData";
import { Context } from "../../../resource/Context";
export declare class SaveTranslate implements ISaveData {
    private static POOL;
    isSaveMark(): boolean;
    restore(context: Context): void;
    static save(context: Context): void;
}
