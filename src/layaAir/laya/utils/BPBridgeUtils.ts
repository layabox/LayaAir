import { Node } from "../display/Node";


export class BPBridgeUtils implements IBPBridge {
    private static _instance: BPBridgeUtils = new BPBridgeUtils;
    static get instance(): BPBridgeUtils {
        return BPBridgeUtils._instance;
    }

    getClass(ext: any): any {
        throw new Error("Method not implemented.");
    }
    runBehaviorTree<T extends Node>(owner: T, behaviorTree: any, excution?: any): boolean {
        throw new Error("Method not implemented.");
    }
}

export interface IBPBridge {
    getClass(ext: any): any

    runBehaviorTree<T extends Node>(owner: T, behaviorTree: any, excution?: any): boolean
}