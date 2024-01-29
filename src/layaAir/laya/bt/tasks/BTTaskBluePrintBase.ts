import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTTaskNode } from "../core/BTTaskNode";
import { EBTNodeResult } from "../core/EBTNodeResult";


export class BTTaskBluePrintBase extends BTTaskNode {
    currentResult: EBTNodeResult;
    isRuning: boolean;
    myCMP: BehaviorTreeComponent;

    constructor() {
        super();
        this.needCreate = true;
    }

    onReciecve?() {

    }

    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        this.myCMP = btCmp;
        if (this.onReciecve) {
            this.isRuning = true;
            this.currentResult = EBTNodeResult.InProgress;
            this.onReciecve();
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