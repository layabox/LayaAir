import { BehaviorTreeComponent, BTExcuteContext } from "./BehaviorTreeComponent";
import { BTConst } from "./BTConst";
import { BTDecorator } from "./BTDecorator";
import { BTNode, BTNodeContext } from "./BTNode";
import { BTService } from "./BTService";
import { BTTaskNode } from "./BTTaskNode";
import { EBTNodeResult } from "./EBTNodeResult";

export abstract class BTCompositeNode extends BTNode {

    children: BTNode[];

    decorators: BTDecorator[];

    services: BTService[];

    private _isFirstRun: boolean;

    constructor() {
        super();
        this.children = [];
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
    }


    onInactive(btCmp: BehaviorTreeComponent) {

    }


    onLeave(btCmp: BehaviorTreeComponent) {
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

    canAddSubTree(btCmp: BehaviorTreeComponent, childId: number): boolean {
        return true;
    }


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

    addChild(node: BTNode): BTNode {
        this.children.push(node);
        node.parentNode = this;
        node.onAdd(this);
        return node;
    }

    preCheck(preNode: BTNode, btCmp: BehaviorTreeComponent): BTNode {
        let lastNode = super.preCheck(preNode, btCmp);

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
        this.children.forEach((value) => {
            lastNode = value.preCheck(lastNode, btCmp);
        })
        return lastNode;
    }

    protected newContext() {
        return new BTCompositeContext();
    }

    /**
     * 结束运行
     */
    onFinishExcute(btCmp: BehaviorTreeComponent): EBTNodeResult {
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.onLeave(btCmp);
            })
        }
        return EBTNodeResult.InProgress;
    }

    private _checkLeave(before: number, btCmp: BehaviorTreeComponent) {
        if (before != BTConst.unInit) {
            let child = this.children[before];
            if (child instanceof BTCompositeNode || child instanceof BTTaskNode) {
                child.onLeave(btCmp);
            }
        }
    }

    private _checkInacitive(before: number, btCmp: BehaviorTreeComponent) {
        if (before != BTConst.unInit) {
            let child = this.children[before];
            if (child instanceof BTCompositeNode || child instanceof BTTaskNode) {
                child.onInactive(btCmp);
            }
        }
    }

    getNext(btCmp: BehaviorTreeComponent, excuteContext: BTExcuteContext, nodeContext: BTCompositeContext) {
        let nextCID: number = BTConst.breakOut;
        if (nodeContext.forceToChild != BTConst.unInit) {
            this._isFirstRun = false;
            nextCID = nodeContext.forceToChild;
            nodeContext.forceToChild = BTConst.unInit;
        }
        else {
            this._isFirstRun = true;
            nextCID = this.getNextChildIndex(btCmp, nodeContext.curChild, excuteContext.lastResult);
        }
        return nextCID;
    }

    /**
     * 执行子节点任务
     * @param btCmp 
     * @param excuteContext 
     * @returns 
     */
    excute(btCmp: BehaviorTreeComponent, excuteContext: BTExcuteContext) {
        let nodeContext = this.getNodeContext(btCmp) as BTCompositeContext;
        let before = nodeContext.curChild;
        let nextCID: number = this.getNext(btCmp, excuteContext, nodeContext);
        let result: BTNode;
        while (true) {
            if (nextCID == BTConst.breakOut) {
                nodeContext.curChild = BTConst.unInit;
                this._checkInacitive(before, btCmp);
                this._checkLeave(before, btCmp);
                result = null;
                break;
            }
            result = this.children[nextCID];
            nodeContext.curChild = nextCID;
            if (BTCompositeNode.canExcute(result as BTTaskNode, btCmp)) {
                this._checkInacitive(before, btCmp);
                if (nextCID != before) {
                    this._checkLeave(before, btCmp);
                }
                this._onChildActive(result, btCmp);
                break;
            }
            else {
                excuteContext.lastResult = EBTNodeResult.Failed;
                nextCID = this.getNext(btCmp, excuteContext, nodeContext);
            }
        }
        return result;
    }


    /**
     * 是否可以执行
     * @param btnode 
     * @param btCmp 
     * @returns 
     */
    static canExcute(btnode: BTTaskNode | BTCompositeNode, btCmp: BehaviorTreeComponent): boolean {
        let result = true;
        let decorators = btnode.decorators;
        if (decorators) {
            for (let i = 0, n = decorators.length; i < n; i++) {
                if (!decorators[i].canExcute(btCmp)) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    }

    _onChildActive(node: BTNode, btCmp: BehaviorTreeComponent) {
        if (node instanceof BTTaskNode || node instanceof BTCompositeNode) {
            if (this._isFirstRun) {
                node.onEnter(btCmp);
            }
            node.onActive(btCmp);
        }
    }

    abstract getNextChildIndex(btCmp: BehaviorTreeComponent, preIndex: number, taskResult: EBTNodeResult): number;

    notifyChildExecution(btCmp: BehaviorTreeComponent, child: BTNode, result: EBTNodeResult) {

    }

}

export class BTCompositeContext extends BTNodeContext {
    curChild: number = BTConst.unInit;
    forceToChild: number = BTConst.unInit;
}