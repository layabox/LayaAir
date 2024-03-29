import { BTDecorator } from "../core/BTDecorator";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";

/**
 * 
 * @ brief: BTDecoratorBluePrintBase
 * @ author: zyh
 * @ data: 2024-03-06 11:09
 */
export class BTDecoratorBluePrintBase extends BTDecorator {
    result: boolean;
    constructor() {
        super();
        this.needCreate = true;
    }
    /**@private */
    canExcute(btCmp:BehaviorTreeComponent): boolean {
        this.onCheck(btCmp);
        return this.result;
    }

    onCheck(btCmp:BehaviorTreeComponent):void{

    }
    
}