import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTTaskNode } from "../core/BTTaskNode";
import { EBTNodeResult } from "../core/EBTNodeResult";


export class BTTaskFinishWithResult extends BTTaskNode {
    result: EBTNodeResult;
    constructor() {
        super();
        this.result = EBTNodeResult.Succeeded;
    }

    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        return this.result;
    }
}