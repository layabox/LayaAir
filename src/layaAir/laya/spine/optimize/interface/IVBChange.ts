import { VBCreator } from "../VBCreator";

export interface IVBChange {
    startFrame:number;
    endFrame:number;
    initChange(vb: VBCreator): boolean;
    updateVB(vb: VBCreator, slots: spine.Slot[]): boolean;
    clone(): IVBChange;
}