import { VBCreator } from "../VBCreator";

export interface IVBChange {
    initChange(slotId: number, vb: VBCreator): void;
    updateVB(vb: VBCreator, slots: spine.Slot[]): void
}