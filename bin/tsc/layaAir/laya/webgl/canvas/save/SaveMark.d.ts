import { Context } from "../../../resource/Context";
import { ISaveData } from "././ISaveData";
export declare class SaveMark implements ISaveData {
    private static POOL;
    _saveuse: number;
    _preSaveMark: SaveMark;
    constructor();
    isSaveMark(): boolean;
    restore(context: Context): void;
    static Create(context: Context): SaveMark;
}
