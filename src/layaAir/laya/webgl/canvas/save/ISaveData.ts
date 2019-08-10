import { Context } from "../../../resource/Context"
export interface ISaveData {
    isSaveMark(): boolean;
    restore(context: Context): void;
}
