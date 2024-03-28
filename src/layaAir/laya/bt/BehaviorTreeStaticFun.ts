import { Node } from "../display/Node";
import { BlackboardComponent } from "./blackborad/BlackboardComponent";
import { BehaviorTree } from "./core/BehaviorTree";
import { BehaviorTreeComponent } from "./core/BehaviorTreeComponent";
import { EBTExecutionMode } from "./core/EBTExecutionMode";

/**
 * 
 * @ brief: BehaviorTreeStaticFun
 * @ author: zyh
 * @ data: 2024-03-19 14:28
 */
export class BehaviorTreeStaticFun {
    
    static runBehaviorTree<T extends Node>(owner: T, behaviorTree: BehaviorTree, excution?: EBTExecutionMode) {
        let bt: BehaviorTreeComponent = owner.getComponent(BehaviorTreeComponent);
        if (!bt) {
            bt = owner.addComponent(BehaviorTreeComponent);
        }
        if ((behaviorTree as any).blackboardAsset) {
            let bb = new BlackboardComponent();
            bb.init((behaviorTree as any).blackboardAsset);
            bt.blackBoradComp = bb;
        }
        bt.startTree(behaviorTree as any, excution);
        return true;
    }
}