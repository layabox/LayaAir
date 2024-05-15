import { AttachmentParse } from "../AttachmentParse";
import { VBCreator } from "../VBCreator";
import { IChange } from "../interface/IChange";

export class ChangeDrawOrder implements IChange {
    order: number[];
    changeOrder(attachMap: AttachmentParse[]): number[] | null {
        // debugger;
        //return [34,0,1,2,3,4,5,6,7,9,10,14,15,16,17,18,19,20,26,21,22,23,24,28,29,25,30,31,32,33,35,27,8,11,12,13]
        //return null;
        return this.order;
        //throw new Error("Method not implemented.");
    }
    change(vb: VBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>): boolean {
        //throw new Error("Method not implemented.");
        return true;
    }
}