import { BTDecorator } from "../core/BTDecorator";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";

/**
 * 
 * @ brief: BTForceSuccess
 * @ author: zyh
 * @ data: 2024-03-06 11:10
 */
export class BTForceSuccess extends BTDecorator {
    canExcute(btCmp: BehaviorTreeComponent): boolean {
        return true;
    }
}