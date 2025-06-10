import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";
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

    restore(runner: GraphicsRunner): void {
        runner._saveMark = this._preSaveMark;
        SaveMark.POOL[SaveMark.POOL._length++] = this;
    }

    static Create(runner: GraphicsRunner): SaveMark {
        var no: any = SaveMark.POOL;
        var o: SaveMark = no._length > 0 ? no[--no._length] : (new SaveMark());
        o._saveuse = 0;
        o._preSaveMark = runner._saveMark;
        runner._saveMark = o;
        return o;
    }
}

