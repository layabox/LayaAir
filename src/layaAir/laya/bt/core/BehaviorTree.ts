
import { BlackboardData } from "../blackborad/BlackboardData";
import { BTCompositeNode } from "./BTCompositeNode";

export class BehaviorTree {
    /**
     * 行为树根节点
     */
    rootNode: BTCompositeNode;
    /**
     * 黑板数据
     */
    blackboardAsset: BlackboardData;
}