import { Laya } from "../../../Laya";
import { BTCompositeContext } from "../core/BTCompositeNode";
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
    isCooldown: boolean;

    canExcute(btCmp: BehaviorTreeComponent): boolean {
        if (this.isCooldown) {
            let context = this.parentNode.getNodeContext(btCmp) as BTCompositeContext;
            context.forceToChild = this.childIndex;
            return false;
        }
        if (this.time > 0) {
            this.isCooldown = true;
            let context = this.parentNode.getNodeContext(btCmp) as BTCompositeContext;
            context.forceToChild = this.childIndex;
            Laya.timer.once(this.time, this, () => {
                this.isCooldown = false;
            });
            return false;
        }
        return true;
    }
}