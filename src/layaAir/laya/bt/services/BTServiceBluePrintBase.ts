import { BTService } from "../core/BTService";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";

/**
 * 
 * @ brief: BTServiceBluePrintBase
 * @ author: zyh
 * @ data: 2024-03-06 11:14
 */
export class BTServiceBluePrintBase extends BTService {
    constructor() {
        super();
        this.needCreate = true;
    }

    onEnter(btCmp: BehaviorTreeComponent) {

    }

    onLeave(btCmp: BehaviorTreeComponent) {

    }

}