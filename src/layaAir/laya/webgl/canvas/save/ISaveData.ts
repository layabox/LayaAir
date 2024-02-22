import { Context } from "../../../renders/Context"
export interface ISaveData {
    isSaveMark(): boolean;
    restore(context: Context): void;
}
