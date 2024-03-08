import { BTDecorator } from "../core/BTDecorator";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";

/**
 * 
 * @ brief: BTCooldown
 * @ author: zyh
 * @ data: 2024-03-06 11:07
 */
export class BTCooldown extends BTDecorator {
    time: number;

    canExcute(btCmp: BehaviorTreeComponent): boolean {
        if (this.time > 0) {
            return false;
        }
        return true;
    }
}