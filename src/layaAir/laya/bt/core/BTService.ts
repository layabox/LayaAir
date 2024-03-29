import { BTAuxiliaryNode } from "./BTAuxiliaryNode";
import { BehaviorTreeComponent } from "./BehaviorTreeComponent";

export class BTService extends BTAuxiliaryNode {
    
    isServerActive(): boolean {
        return this._active;
    }
}