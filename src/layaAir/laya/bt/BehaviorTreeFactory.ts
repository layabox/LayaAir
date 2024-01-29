import { BTCompositeSelector } from "./composites/BTCompositeSelector";
import { BTCompositeSequence } from "./composites/BTCompositeSequence";
import { BTSimpleParallel } from "./composites/BTSimpleParallel";
import { BTBlackBorad } from "./decorators/BTBlackBorad";
import { BTLoop } from "./decorators/BTLoop";
import { TestService } from "./services/TestService";
import { BTTaskBluePrintBase } from "./tasks/BTTaskBluePrintBase";
import { BTTaskFinishWithResult } from "./tasks/BTTaskFinishWithResult";
import { BTTaskRunBehavior } from "./tasks/BTTaskRunBehavior";
import { BTTaskTest } from "./tasks/BTTaskTest";
import { BTTaskWait } from "./tasks/BTTaskWait";

export class BehaviorTreeFactory {
    constructor() {

    }

    static __init__() {
        //REG
        BTCompositeSelector;
        BTCompositeSequence;
        BTSimpleParallel;

        BTBlackBorad;
        BTLoop;

        TestService;

        BTTaskBluePrintBase;
        BTTaskFinishWithResult;
        BTTaskRunBehavior;
        BTTaskTest;
        BTTaskWait;
    }
}