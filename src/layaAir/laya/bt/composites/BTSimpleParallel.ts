import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTCompositeNode, BTCompositeContext } from "../core/BTCompositeNode";
import { BTConst } from "../core/BTConst";
import { BTNode } from "../core/BTNode";
import { BTTaskNode } from "../core/BTTaskNode";
import { EBTNodeResult } from "../core/EBTNodeResult";



export class BTSimpleParallel extends BTCompositeNode {
    finishMode: EBTFinishMode;

    getNextChildIndex(btCmp: BehaviorTreeComponent, preIndex: number, taskResult: EBTNodeResult): number {
        //throw new Error("Method not implemented.");
        let context = this.getNodeContext(btCmp) as BTSimpleParallelContext;
        let result = BTConst.breakOut;
        let len = this.children.length;
        if (preIndex == BTConst.unInit) {
            result = 0;
        }
        else if (context.isMainTaskActive) {
            result = 1;
        }
        // else{
        //     result =1;
        // }
        return result;
    }

    onLeave(btCmp: BehaviorTreeComponent) {
        super.onLeave(btCmp);
        let context = this.getNodeContext(btCmp) as BTSimpleParallelContext;
    }


    canAddSubTree(btCmp: BehaviorTreeComponent, childId: number): boolean {
        //主任务不能是子树
        return childId != 0;
    }



    notifyChildExecution(btCmp: BehaviorTreeComponent, child: BTNode, result: EBTNodeResult) {
        let context = this.getNodeContext(btCmp) as BTSimpleParallelContext;
        let cid = this.children.indexOf(child);
        if (cid == 0) {

            if (result == EBTNodeResult.InProgress) {
                context.isMainTaskActive = true;
                context.keepSubtask = false;
                btCmp.addParallelTask(this.children[0] as BTTaskNode);
                btCmp.runNext();
            }
            else if (context.isMainTaskActive) {
                context.isMainTaskActive = false;
                btCmp.removeParallelTask(this.children[0] as BTTaskNode);


            }
            // else if(){

            // }

        }
    }

    protected newContext() {
        return new BTSimpleParallelContext();
    }

}

class BTSimpleParallelContext extends BTCompositeContext {
    isMainTaskActive: boolean;
    keepSubtask: boolean;

    reset() {
        this.isMainTaskActive = false;

    }
}

enum EBTFinishMode {
    Immediate,
    Delayed
}