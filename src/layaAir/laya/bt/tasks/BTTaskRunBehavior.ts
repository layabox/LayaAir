import { BehaviorTree } from "../core/BehaviorTree";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTTaskNode } from "../core/BTTaskNode";
import { EBTNodeResult } from "../core/EBTNodeResult";


export class BTTaskRunBehavior extends BTTaskNode {
    btTree: BehaviorTree;


    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        if (this.btTree) {
            let addResult = btCmp.addInstance(this.btTree);
            if (addResult) {
                return EBTNodeResult.InProgress;
            }
            return EBTNodeResult.Failed
        }
        else {
            return EBTNodeResult.Failed;
        }
    }

    // onActive(btCmp: BehaviorTreeComponent) {
    //     debugger;
    //     super.onActive(btCmp);
    // }


}