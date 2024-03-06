import { Laya } from "../../../Laya";
import { BehaviorTreeFactory } from "../BehaviorTreeFactory";

/**
 * 
 * @ brief: BehaviorTreeCreateUtil
 * @ author: zyh
 * @ data: 2024-03-04 16:28
 */
export class BehaviorTreeCreateUtil {
    static __init__(): Promise<void> {
        BehaviorTreeFactory.__init__();
        return Promise.resolve();
    }
}

Laya.addBeforeInitCallback(BehaviorTreeCreateUtil.__init__);
