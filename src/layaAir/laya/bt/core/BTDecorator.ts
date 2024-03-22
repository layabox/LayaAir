import { BehaviorTreeComponent } from "./BehaviorTreeComponent";
import { BTAuxiliaryNode } from "./BTAuxiliaryNode";

export class BTDecorator extends BTAuxiliaryNode {

    canExcute(btCmp:BehaviorTreeComponent): boolean {
        return true;
    }

    isDecoratorObserverActive(): boolean {
        return false;
    }

    isDecoratorExecutionActive(): boolean {
        return this._active;
    }
}