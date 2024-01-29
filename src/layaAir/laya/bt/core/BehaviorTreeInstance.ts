import { BTCompositeNode } from "./BTCompositeNode";
import { BTNode, BTNodeContext } from "./BTNode";

import { BTTaskNode } from "./BTTaskNode";

export class BehaviorTreeInstance {
    /**
     * 行为树根节点
     */
    rootNode: BTCompositeNode;
    /**
     * 当前激活节点
     */
    activeNode: BTNode;
    /**
     * 节点实例对象缓存Map
     */
    contextMap: Map<string, BTNodeContext>;

    nodeInstanceMap: Map<string, BTNode>;
    /**
     * 并行主任务
     */
    parallelTasks: BTTaskNode[];

    constructor() {
        this.contextMap = new Map();
        this.nodeInstanceMap = new Map();
        this.parallelTasks = [];
    }

    getContextNode(id: string) {
        return this.contextMap.get(id);
    }

    setContextNode(id: string, context: BTNodeContext) {
        this.contextMap.set(id, context);
    }

    getNode(id: string): BTNode {
        return this.nodeInstanceMap.get(id);
    }

    setNode(id: string, node: BTNode) {
        this.nodeInstanceMap.set(id, node);
    }

    /**
     * 
     * @param taskNode 
     */
    addParallelTask(taskNode: BTTaskNode): void {
        if (this.parallelTasks.indexOf(taskNode) == -1) {
            this.parallelTasks.push(taskNode);
        }
    }

    /**
     * 
     * @param taskNode 
     */
    removeParallelTask(taskNode: BTTaskNode): void {
        let index = this.parallelTasks.indexOf(taskNode);
        if (index != -1) {
            this.parallelTasks.splice(index, 1);
        }
    }
}