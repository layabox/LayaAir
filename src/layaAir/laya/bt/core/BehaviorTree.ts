import { Laya } from "../../../Laya";
import { BehaviorTreeFactory } from "../BehaviorTreeFactory";
import { BlackboardData } from "../blackborad/BlackboardData";
import { BlackboardImpl } from "../adapter/resource/BlackboardImpl";
import { BTCompositeNode } from "./BTCompositeNode";
import { URL } from "../../net/URL";

export class BehaviorTree {
    /**
     * 行为树根节点
     */
    rootNode: BTCompositeNode;
    /**
     * 黑板数据
     */
    blackboardAsset: BlackboardData;

    parse(config: any) {
        let data = config.data;
        let rootId = data.root.childs[0];
        if (rootId == null) throw new Error("root node is null");

        let rootData = data[rootId];
        this.rootNode = BehaviorTreeFactory.instance.createNew(rootData, data) as BTCompositeNode;
        if (config.blackboardAsset)
            this.blackboardAsset = (Laya.loader.getRes(URL.getResURLByUUID(config.blackboardAsset)) as BlackboardImpl).create();
    }

}