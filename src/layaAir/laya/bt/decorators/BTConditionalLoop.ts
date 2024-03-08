import { BlackBoardUtils, EBBOtherOperation } from "../blackborad/EBlackBoard";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTLoop } from "./BTLoop";

/**
 * 
 * @ brief: BTConditionalLoop
 * @ author: zyh
 * @ data: 2024-03-06 11:06
 */
export class BTConditionalLoop extends BTLoop {
    op: EBBOtherOperation;
    keyName: string;

    canExcute(btCmp: BehaviorTreeComponent): boolean {
        return BlackBoardUtils.caculateOtherValue(btCmp.blackBoradComp, this.op, this.keyName);
    }
}