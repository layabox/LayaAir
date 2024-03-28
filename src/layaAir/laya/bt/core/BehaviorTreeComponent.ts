import { Script } from "../../components/Script";
import { Timer } from "../../utils/Timer";
import { BlackboardComponent } from "../blackborad/BlackboardComponent";
import { BehaviorTree } from "./BehaviorTree";
import { BehaviorTreeInstance } from "./BehaviorTreeInstance";

import { BTCompositeNode } from "./BTCompositeNode";
import { BTTaskNode } from "./BTTaskNode";
import { EBTExecutionMode } from "./EBTExecutionMode";
import { EBTNodeResult } from "./EBTNodeResult";
import { ITickManger } from "./ITickManger";

export class BehaviorTreeComponent extends Script implements ITickManger {

    //bTree:BehaviorTree;
    /**
     * 行为树列表 （包含子树）
     */
    list: BehaviorTreeInstance[];
    /**
     * 执行上下文
     */
    excuteContext: BTExcuteContext;
    /**
     * 执行模式 是否循环
     */
    excutionMode: EBTExecutionMode;
    /**
     * 黑板组件
     */
    blackBoradComp: BlackboardComponent;
    /**
     * 当前运行行为树的小标
     */
    activeID: number;
    timer: Timer;
    constructor() {
        super();
        this.timer = new Timer();
        this.list = [];
        this.excuteContext = new BTExcuteContext();
        this.blackBoradComp = new BlackboardComponent();
    }

    getCurrentTreeInstance() {
        return this.list[this.activeID];
    }

    addParallelTask(task: BTTaskNode) {
        let currentBT = this.list[this.activeID];
        currentBT.addParallelTask(task);
    }

    removeParallelTask(task: BTTaskNode) {
        this.list[this.activeID].removeParallelTask(task);
    }


    startTree(bTree: BehaviorTree, excution: EBTExecutionMode = EBTExecutionMode.Looped) {
        this.excuteContext.target = bTree.target;
        this.excutionMode = excution;
        this.addInstance(bTree);
    }

    addInstance(bTree: BehaviorTree): boolean {
        let activeNode = this.list.length > 0 ? this.list[this.activeID].activeNode : null;
        let activeParent = activeNode ? activeNode.parentNode : null;
        if (activeParent) {
            let c = activeParent.canAddSubTree(this, activeParent.children.indexOf(activeNode));
            if (!c) {
                console.warn("非法子树");
                return false;
            }
        }
        let behaviorTreeIns = new BehaviorTreeInstance();
        this.list.push(behaviorTreeIns);
        this.activeID = this.list.length - 1;
        this.excuteContext.exuteInstanceId = this.activeID;
        behaviorTreeIns.rootNode = bTree.rootNode;
        behaviorTreeIns.activeNode = null;
        bTree.rootNode.preCheck(null, this);
        this.excuteContext.excuteNode = null;
        this.nextFrame();
        return true;
    }


    runNext() {
        this.excuteContext.lastResult = EBTNodeResult.Succeeded;
        this.nextFrame();
    }

    onTaskCall(task: BTTaskNode, result: EBTNodeResult = EBTNodeResult.Succeeded): boolean {
        let current = this.list[this.activeID];
        let tid = current.parallelTasks.indexOf(task);
        if (tid != -1) {
            this.onTaskFinished(task, result, true);
            return true;
        }
        else {
            if (this.list[this.activeID].activeNode == task) {
                this.onTaskFinished(task, result, false);
                return true;
            }
            return false;
        }
    }

    update(task: BTTaskNode, hasDebuggerPause: boolean = true): void {
        if (task && this.onTaskCall(task)) {
            return;
        }
        let current = this.list[this.activeID];

        let currentNode: BTTaskNode;
        let currentCompositeNode: BTCompositeNode;
        let runNext = (excuteContext: BTExcuteContext) => {
            let result = currentCompositeNode.excute(this, excuteContext);
            if (!result) {
                currentCompositeNode = currentCompositeNode.parentNode;
                currentNode = null;
                if (!currentCompositeNode) {
                    if (this.activeID > 0) {
                        //子树
                        this.list.length = this.activeID;
                        this.activeID--;

                        current = this.list[this.activeID];
                        // debugger;
                        // currentNode=;
                        this.onTaskFinished(this.list[this.activeID].activeNode as BTTaskNode, excuteContext.lastResult, false);
                        // currentCompositeNode = this.list[this.activeID].activeNode.parentNode;
                        // runNext(excuteContext);
                    }
                    return;
                }
                runNext(excuteContext);
            }
            else {
                if (result instanceof BTTaskNode) {
                    currentNode = result;
                }
                else {
                    currentNode = null;
                    currentCompositeNode = result as BTCompositeNode;
                    if (currentCompositeNode && currentCompositeNode.hasDebugger) return;
                    runNext(excuteContext);
                }
            }
        }

        if (current.activeNode == null && this.excuteContext.excuteNode == null) {
            currentCompositeNode = current.rootNode;
            if (hasDebuggerPause && currentCompositeNode.beginExcute(this, this.excuteContext)) return;
            runNext(this.excuteContext);
        }
        else {
            currentNode = current.activeNode as BTTaskNode;
            currentCompositeNode = this.excuteContext.excuteNode;

            if (currentNode) {
                if (this.excuteContext.lastResult != EBTNodeResult.InProgress) {
                    if (hasDebuggerPause && currentCompositeNode.beginExcute(this, this.excuteContext)) return;
                    runNext(this.excuteContext);
                }
            }
        }


        if (currentNode) {
            current.activeNode = currentNode;
            this.excuteContext.excuteNode = currentCompositeNode;
            if (currentNode.hasDebugger) return;
            this.executeTask(currentNode);
        }
        else {
            if (currentCompositeNode && currentCompositeNode.hasDebugger) return;
            //如果是循环模式
            if (this.excutionMode == EBTExecutionMode.Looped) {
                current.activeNode = null;
                this.excuteContext.excuteNode = null;
                this.nextFrame();
            }
        }
    }


    onTaskFinished(taskNode: BTTaskNode, taskResult: EBTNodeResult, isParalleTask: boolean) {
        if (taskNode == null || this.list.length == 0) {
            return;
        }
        taskNode.parentNode.notifyChildExecution(this, taskNode, taskResult);
        if (taskResult != EBTNodeResult.InProgress) {
            taskNode.onTaskFinished(this, taskResult);
            if (this.list[this.activeID].activeNode == taskNode) {
                // debugger;
                if (!isParalleTask) {
                    this.excuteContext.lastResult = taskResult;
                }
                if (taskResult != EBTNodeResult.Aborted) {
                    this.nextFrame();
                }
            }
        }
    }

    nextFrame() {
        this.timer.frameOnce(1, this, this.update);
    }

    executeTask(task: BTTaskNode) {
        let result = task.tryExcuteTask(this);
        this.onTaskFinished(task, result, false);
    }

}

export class BTExcuteContext {
    target: string;
    exuteInstanceId: number;
    lastResult: EBTNodeResult;
    excuteNode: BTCompositeNode;
    childNext?: any;
}