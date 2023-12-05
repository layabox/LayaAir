import { BPPin } from "../core/BPPin";
import { BPEditNode } from "./BPEditNode";

export class BPPinEdit extends BPPin {
    /**
     * 所属节点
    */
    owner: BPEditNode;
    /**
     * 检查
     * @param e 
     */
    checkLinkTo(e: BPPinEdit) {

    }
}