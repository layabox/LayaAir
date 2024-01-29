import { BehaviorTreeComponent } from "./BehaviorTreeComponent";
import { BTDecorator } from "./BTDecorator";
import { BTNode, BTNodeContext } from "./BTNode";
import { BTService } from "./BTService";
import { EBTNodeResult } from "./EBTNodeResult";

export class BTTaskNode extends BTNode {

    decorators: BTDecorator[];

    services: BTService[];

    addService(service: BTService) {
        if (!this.services) {
            this.services = [];
        }
        this.services.push(service);
        service.parentNode = this.parentNode;
        service.childIndex = this.parentNode.children.indexOf(this);

    }

    addDecorator(decorator: BTDecorator) {
        if (!this.decorators) {
            this.decorators = [];
        }
        this.decorators.push(decorator);
        decorator.parentNode = this.parentNode;
        decorator.childIndex = this.parentNode.children.indexOf(this);
    }

    preCheck(preNode: BTNode, btCmp: BehaviorTreeComponent): BTNode {
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.createNodeContext(btCmp);
            })
        }
        if (this.services) {
            this.services.forEach(value => {
                value.createNodeContext(btCmp);
            })
        }
        return super.preCheck(preNode, btCmp);
    }
    /**
     * 由于有可能任务节点需要重新new一个对象，有些只需要实例化一个数据区
     * @param btCmp 
     * @returns 
     */
    tryExcuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        if (this.needCreate) {
            let task: BTTaskNode = this.getNodeInstance(btCmp) as BTTaskNode;
            return task.excuteTask(btCmp);
        }
        else {
            return this.excuteTask(btCmp);
        }
    }

    excuteTask(btCmp: BehaviorTreeComponent): EBTNodeResult {
        return EBTNodeResult.Succeeded;
    }


    finishLatentTask(btCmp: BehaviorTreeComponent, taskResult: EBTNodeResult) {
        //
        let task = this.orignNode as BTTaskNode || this;
        btCmp.onTaskFinished(task, taskResult, false);
    }


    onTaskFinished(btCmp: BehaviorTreeComponent, taskResult: EBTNodeResult) {

        //a.a
    }

    protected newContext() {
        return new BTTaskNodeContext();
    }

    onEnter(btCmp: BehaviorTreeComponent) {
        //let a = this.getNodeContext(btCmp);
        //console.log(">>>>>>>>>>任务真的开始：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount);
        if (this.services) {
            this.services.forEach(value => {
                value.onEnter(btCmp);
            })
        }
    }


    onActive(btCmp: BehaviorTreeComponent) {
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.onActive(btCmp);
            })
        }
        let a = this.getNodeContext(btCmp);
        //console.log(">>>>>>>>>>任务开始：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount)
    }

    onInactive(btCmp: BehaviorTreeComponent) {
        //let a = this.getNodeContext(btCmp);
        //console.log(">>>>>>>>>>任务结束：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount)
    }



    onLeave(btCmp: BehaviorTreeComponent) {
        // let a = this.getNodeContext(btCmp);
        // console.log(">>>>>>>>>>任务真的结束：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount);

        if (this.services) {
            this.services.forEach(value => {
                value.onLeave(btCmp);
            })
        }
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.onLeave(btCmp);
            })
        }
    }

}

export class BTTaskNodeContext extends BTNodeContext {
}