import { Laya } from "../../../Laya";
import { Stat } from "../../utils/Stat";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTTaskNode, BTTaskNodeContext } from "../core/BTTaskNode";
import { EBTNodeResult } from "../core/EBTNodeResult";


export class BTTaskWait extends BTTaskNode {

    waitTime: number = 2;

    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        //btCmp.nextTime(this.waitTime * 1000, this);

        let waitContext = this.getNodeContext(btCmp) as BTTaskWaitContext;
        btCmp.timer.once(this.waitTime * 1000, waitContext, waitContext.onFinish, [btCmp, this]);

        console.log(">>>>>>>>>>>>wait Task " + this.name + ">>" + Stat.loopCount);
        return EBTNodeResult.InProgress;
    }

    protected newContext() {
        return new BTTaskWaitContext();
    }
}

class BTTaskWaitContext extends BTTaskNodeContext {

    onFinish(btCmp: BehaviorTreeComponent, task: BTTaskWait) {
        btCmp.update(task);
    }

}