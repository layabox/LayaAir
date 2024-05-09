import { VBCreator } from "../VBCreator";

export interface IVBChange {
    initChange(vb: VBCreator): boolean;
    updateVB(vb: VBCreator, slots: spine.Slot[]): boolean;
    clone(): IVBChange;
}