import { Node } from "../../display/Node";
import { BlackboardComponent } from "../blackborad/BlackboardComponent";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTTaskNode } from "../core/BTTaskNode";
import { EBTNodeResult } from "../core/EBTNodeResult";


export class BTTaskBluePrintBase extends BTTaskNode {
    /**
     * @private
     */
    currentResult: EBTNodeResult;
    /**
     * @private
     */
    isRuning: boolean;
    /**
     * @private
     */
    myCMP: BehaviorTreeComponent;

    constructor() {
        super();
        this.needCreate = true;
    }

    onReciecve?<T extends Node>(owner:T) {

    }

    getOwnersBlackBoard():BlackboardComponent {
        return this.myCMP.blackBoradComp;
    }
    /**
     * @private
     * @param btCmp 
     * @returns 
     */
    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        this.myCMP = btCmp;
        if (this.onReciecve) {
            this.isRuning = true;
            this.currentResult = EBTNodeResult.InProgress;
            this.onReciecve<Node>(btCmp.owner);
            this.isRuning = false;
        }
        else {
            this.currentResult = EBTNodeResult.Failed;
        }
        return this.currentResult;
    }

    finishWithResult(result: EBTNodeResult) {
        this.currentResult = result;
        if (!this.isRuning) {
            this.finishLatentTask(this.myCMP, result);
        }
    }
}