import { EBBNumberOperation } from "../blackborad/EBlackBoard";
import { BTDecorator } from "../core/BTDecorator";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";

/**
 * 
 * @ brief: BTCompareBBEntries
 * @ author: zyh
 * @ data: 2024-03-06 10:27
 */
export class BTCompareBBEntries extends BTDecorator {
    op: EBBNumberOperation.equal | EBBNumberOperation.notEqual;
    keyNameA: string;
    keyNameB: string;

    canExcute(btCmp: BehaviorTreeComponent): boolean {
        let blackBoard = btCmp.blackBoradComp;
        let valueA = blackBoard.getData(this.keyNameA);
        let valueB = blackBoard.getData(this.keyNameB);
        if (this.op === EBBNumberOperation.equal) {
            return valueA === valueB;
        } else {
            return valueA !== valueB;
        }
    }
}