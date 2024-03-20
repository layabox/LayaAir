import { BehaviorTreeComponent } from "./BehaviorTreeComponent";
import { BTNode } from "./BTNode";

export class BTAuxiliaryNode extends BTNode {

    protected _active: boolean;
    childIndex: number;

    onActive(btCmp: BehaviorTreeComponent) {
        this._active = true;
    }

    onEnter(btCmp: BehaviorTreeComponent) {

    }

    onLeave(btCmp: BehaviorTreeComponent) {

    }

}