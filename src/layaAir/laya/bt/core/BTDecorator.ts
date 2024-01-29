import { BehaviorTreeComponent } from "./BehaviorTreeComponent";
import { BTAuxiliaryNode } from "./BTAuxiliaryNode";

export class BTDecorator extends BTAuxiliaryNode {

    onActive(btCmp: BehaviorTreeComponent) {

    }

    onLeave(btCmp: BehaviorTreeComponent) {

    }

    canExcute(btCmp:BehaviorTreeComponent): boolean {
        return true;
    }

}