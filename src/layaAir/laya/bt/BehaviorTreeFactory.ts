import { BlueprintUtil } from "../bp/core/BlueprintUtil";
import { BTCompositeSelector } from "./composites/BTCompositeSelector";
import { BTCompositeSequence } from "./composites/BTCompositeSequence";
import { BTSimpleParallel } from "./composites/BTSimpleParallel";
import { BTNode } from "./core/BTNode";
import { BTType, TBTNode } from "./datas/types/BehaviorTreeTypes";
import { BTBlackBorad } from "./decorators/BTBlackBorad";
import { BTCompareBBEntries } from "./decorators/BTCompareBBEntries";
import { BTConditionalLoop } from "./decorators/BTConditionalLoop";
import { BTCooldown } from "./decorators/BTCooldown";
import { BTDecoratorBluePrintBase } from "./decorators/BTDecoratorBluePrintBase";
import { BTForceSuccess } from "./decorators/BTForceSuccess";
import { BTLoop } from "./decorators/BTLoop";
import { BTServiceBluePrintBase } from "./services/BTServiceBluePrintBase";
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
        this.regBTClass(BTType.Cooldown, BTCooldown);
        this.regBTClass(BTType.BlackBorad, BTBlackBorad);
        this.regBTClass(BTType.ForceSuccess, BTForceSuccess);
        this.regBTClass(BTType.ConditionalLoop, BTConditionalLoop);
        this.regBTClass(BTType.CompareBBEntries, BTCompareBBEntries);

        TestService;

        BTDecoratorBluePrintBase;
        BTServiceBluePrintBase;
        BTTaskBluePrintBase;
        
        this.regBTClass(BTType.Test, BTTaskTest);
        this.regBTClass(BTType.Wait, BTTaskWait);
        this.regBTClass(BTType.RunBehavior, BTTaskRunBehavior);
        this.regBTClass(BTType.FinishWithResult, BTTaskFinishWithResult);
    }

    static regBTClass(type: BTType, cls: new () => BTNode) {
        this._btMap.set(type, cls);
    }

    //调试运行时用
    static initHook(parent: string) {

    }

    createNew(config: TBTNode) {
        let cls = BehaviorTreeFactory._btMap.get(config.cid);
        if (!cls) {
            cls = BlueprintUtil.getClass(config.cid);
        }
        let result = new cls();
        result.nid = config.id;
        result.parse(config);
        return result;
    }

    static get instance() {
        if (!BehaviorTreeFactory._instance) {
            BehaviorTreeFactory._instance = new BehaviorTreeFactory();
        }
        return BehaviorTreeFactory._instance;
    }
}