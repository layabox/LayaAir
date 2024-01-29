import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTCompositeNode } from "../core/BTCompositeNode";
import { BTConst } from "../core/BTConst";
import { EBTNodeResult } from "../core/EBTNodeResult";

export class BTCompositeSelector extends BTCompositeNode {
    getNextChildIndex(btCmp: BehaviorTreeComponent, preIndex: number, taskResult: EBTNodeResult): number {
        let result = BTConst.breakOut;
        let len = this.children.length;
        if (preIndex == BTConst.unInit) {
            result = 0;

        }
        else if (taskResult == EBTNodeResult.Failed && preIndex + 1 < len) {
            result = preIndex + 1;
        }
        return result;
    }

}