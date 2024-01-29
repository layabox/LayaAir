import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTCompositeContext } from "../core/BTCompositeNode";
import { BTDecorator } from "../core/BTDecorator";
import { BTNodeContext } from "../core/BTNode";


export class BTLoop extends BTDecorator {
    loopCount: number;

    protected newContext() {
        let rs = new BTLoopContext();
        rs.remaining = this.loopCount;
        return rs;
    }

    onActive(btCmp: BehaviorTreeComponent) {
        let context = this.getNodeContext(btCmp) as BTLoopContext;
        context.remaining--;
        if (context.remaining > 0) {
            let context = this.parentNode.getNodeContext(btCmp) as BTCompositeContext;
            context.forceToChild = this.childIndex;
        }
    }


    onLeave(btCmp: BehaviorTreeComponent) {
        let context = this.getNodeContext(btCmp) as BTLoopContext;
        context.remaining = this.loopCount;
    }
}

class BTLoopContext extends BTNodeContext {
    remaining: number;
}