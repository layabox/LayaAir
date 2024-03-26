import { BehaviorTreeFactory } from "../BehaviorTreeFactory";
import { BehaviorTreeComponent, BTExcuteContext } from "./BehaviorTreeComponent";
import { BTConst } from "./BTConst";
import { BTExecutableNode } from "./BTExecutableNode";
import { BTNode, BTNodeContext } from "./BTNode";
import { BTTaskNode } from "./BTTaskNode";
import { EBTNodeResult } from "./EBTNodeResult";

export abstract class BTCompositeNode extends BTExecutableNode {

    children: BTNode[];

    private _isFirstRun: boolean;

    constructor() {
        super();
        this.children = [];
    }

    onEnter(btCmp: BehaviorTreeComponent) {
        //let a = this.getNodeContext(btCmp);
        //console.log(">>>>>>>>>>任务真的开始：" + a.nodeName + ">>>>:" + Laya.Stat.loopCount);
        super.onEnter(btCmp);
    }


    onActive(btCmp: BehaviorTreeComponent) {
        super.onActive(btCmp);
    }


    onInactive(btCmp: BehaviorTreeComponent) {

    }


    onLeave(btCmp: BehaviorTreeComponent) {
        super.onLeave(btCmp);
    }

    canAddSubTree(btCmp: BehaviorTreeComponent, childId: number): boolean {
        return true;
    }

    addChild(node: BTNode): BTNode {
        this.children.push(node);
        node.parentNode = this;
        node.onAdd(this);
        return node;
    }

    parse(config: any) {
        super.parse(config);
    }

    preCheck(preNode: BTNode, btCmp: BehaviorTreeComponent): BTNode {
        let lastNode = super.preCheck(preNode, btCmp);

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
            if (BTCompositeNode.canExcute(result as BTExecutableNode, btCmp)) {
                const _next = () => {
                    this._checkInacitive(before, btCmp);
                    if (nextCID != before) {
                        this._checkLeave(before, btCmp);
                    }
                    this._onChildActive(result, btCmp);
                }
                if ((result as BTExecutableNode).beginExcute(btCmp, excuteContext)) {
                    excuteContext.childNext = _next;
                    break;
                }
                _next();
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
    static canExcute(btnode: BTExecutableNode, btCmp: BehaviorTreeComponent): boolean {
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