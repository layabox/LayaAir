import { AttachmentParse } from "../AttachmentParse";
import { VBCreator } from "../VBCreator";

export interface IChange {
    change(vb: VBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>): boolean;

    changeOrder(attachMap: AttachmentParse[]): number[] | null;
}