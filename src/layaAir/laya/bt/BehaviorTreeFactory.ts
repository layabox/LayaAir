import { BTCompositeSelector } from "./composites/BTCompositeSelector";
import { BTCompositeSequence } from "./composites/BTCompositeSequence";
import { BTSimpleParallel } from "./composites/BTSimpleParallel";
import { BTNode } from "./core/BTNode";
import { BTType } from "./core/BehaviorTreeTypes";
import { BTBlackBorad } from "./decorators/BTBlackBorad";
import { BTLoop } from "./decorators/BTLoop";
import { TestService } from "./services/TestService";
import { BTTaskBluePrintBase } from "./tasks/BTTaskBluePrintBase";
import { BTTaskFinishWithResult } from "./tasks/BTTaskFinishWithResult";
import { BTTaskRunBehavior } from "./tasks/BTTaskRunBehavior";
import { BTTaskTest } from "./tasks/BTTaskTest";
import { BTTaskWait } from "./tasks/BTTaskWait";

export class BehaviorTreeFactory {
    private static _instance: BehaviorTreeFactory;
    private static _btMap: Map<BTType, new () => BTNode>;
    constructor() {

    }

    static __init__() {

        this._btMap = new Map();

        //REG
        this.regBTClass(BTType.Parallel, BTSimpleParallel);
        this.regBTClass(BTType.Selector, BTCompositeSelector);
        this.regBTClass(BTType.Sequence, BTCompositeSequence);

        this.regBTClass(BTType.Loop, BTLoop);
        this.regBTClass(BTType.BlackBorad, BTBlackBorad);

        TestService;

        BTTaskBluePrintBase;
        this.regBTClass(BTType.Test, BTTaskTest);
        this.regBTClass(BTType.Wait, BTTaskWait);
        this.regBTClass(BTType.RunBehavior, BTTaskRunBehavior);
        this.regBTClass(BTType.FinishWithResult, BTTaskFinishWithResult);
    }

    static regBTClass(type: BTType, cls: new () => BTNode) {
        this._btMap.set(type, cls);
    }

    createNew(config: any, btConfig: any) {
        let cls = BehaviorTreeFactory._btMap.get(config.cid);
        let result = new cls();
        result.parse(config, btConfig);
        return result;
    }

    static get instance() {
        if (!BehaviorTreeFactory._instance) {
            BehaviorTreeFactory._instance = new BehaviorTreeFactory();
        }
        return BehaviorTreeFactory._instance;
    }
}