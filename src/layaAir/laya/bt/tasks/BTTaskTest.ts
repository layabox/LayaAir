import { Stat } from "../../utils/Stat";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTTaskNode } from "../core/BTTaskNode";
import { EBTNodeResult } from "../core/EBTNodeResult";


export class BTTaskTest extends BTTaskNode {
    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        console.log(">>>>>>>>>>>>RUN test Task " + this.name + ">>" + Stat.loopCount);

        // if(this.name=="test1"){
        //     return EBTNodeResult.Failed;
        // }
        return EBTNodeResult.Succeeded;
    }
}