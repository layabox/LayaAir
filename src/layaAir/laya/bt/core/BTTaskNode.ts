import { BehaviorTreeComponent } from "./BehaviorTreeComponent";
import { BTExecutableNode } from "./BTExecutableNode";
import { BTNodeContext } from "./BTNode";
import { EBTNodeResult } from "./EBTNodeResult";

export class BTTaskNode extends BTExecutableNode {
    /**
     * 由于有可能任务节点需要重新new一个对象，有些只需要实例化一个数据区
     * @param btCmp 
     * @returns 
     */
    tryExcuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        if (this.needCreate) {
            let task: BTTaskNode = this.getNodeInstance(btCmp) as BTTaskNode;
            if(task.beginExcute(btCmp)){
                return EBTNodeResult.InProgress;
            }
            return task.excuteTask(btCmp);
        }
        else {
            if(this.beginExcute(btCmp)){
                return EBTNodeResult.InProgress;
            }
            return this.excuteTask(btCmp);
        }
    }
    /**@private */
    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        return EBTNodeResult.Succeeded;
    }

    /**@private */
    finishLatentTask(btCmp: BehaviorTreeComponent, taskResult: EBTNodeResult) {
        //
        let task = this.orignNode as BTTaskNode || this;
        btCmp.onTaskFinished(task, taskResult, false);
    }

    
    onTaskFinished(btCmp: BehaviorTreeComponent, taskResult: EBTNodeResult) {

        //a.a
    }
    /**@private */
    parse(config: any): void {
        super.parse(config);
    }

    protected newContext() {
        return new BTTaskNodeContext();
    }

    onEnter(btCmp: BehaviorTreeComponent) {
        //let a = this.getNodeContext(btCmp);
        //console.log(">>>>>>>>>>任务真的开始：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount);
        super.onEnter(btCmp);
    }


    onActive(btCmp: BehaviorTreeComponent) {
        super.onActive(btCmp);
        let a = this.getNodeContext(btCmp);
        //console.log(">>>>>>>>>>任务开始：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount)
    }

    onInactive(btCmp: BehaviorTreeComponent) {
        //let a = this.getNodeContext(btCmp);
        //console.log(">>>>>>>>>>任务结束：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount)
    }
    /**@private */
    isTaskExecuting(): boolean {
        return false;
    }
    /**@private */
    isTaskAborting(): boolean {
        return false;
    }
}

export class BTTaskNodeContext extends BTNodeContext {
}