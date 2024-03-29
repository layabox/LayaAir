import { BehaviorTreeComponent } from "./BehaviorTreeComponent";
import { BTAuxiliaryNode } from "./BTAuxiliaryNode";

export class BTDecorator extends BTAuxiliaryNode {
     /**@private */
    canExcute(btCmp:BehaviorTreeComponent): boolean {
        return true;
    }
    /**@private */
    isDecoratorObserverActive(): boolean {
        return false;
    }
    /**@private */
    isDecoratorExecutionActive(): boolean {
        return this._active;
    }
}