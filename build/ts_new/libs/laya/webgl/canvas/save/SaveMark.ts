import { Context } from "../../../resource/Context";
import { ISaveData } from "./ISaveData";
import { SaveBase } from "./SaveBase";

export class SaveMark implements ISaveData {

    private static POOL: any = SaveBase._createArray();
    /**@internal */
    _saveuse: number = 0;
    /**@internal */
    _preSaveMark: SaveMark;

    constructor() {
    }

    isSaveMark(): boolean {
        return true;
    }

    restore(context: Context): void {
        context._saveMark = this._preSaveMark;
        SaveMark.POOL[SaveMark.POOL._length++] = this;
    }

    static Create(context: Context): SaveMark {
        var no: any = SaveMark.POOL;
        var o: SaveMark = no._length > 0 ? no[--no._length] : (new SaveMark());
        o._saveuse = 0;
        o._preSaveMark = context._saveMark;
        context._saveMark = o;
        return o;
    }
}

