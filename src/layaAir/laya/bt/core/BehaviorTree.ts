import { Laya } from "../../../Laya";
import { BehaviorTreeFactory } from "../BehaviorTreeFactory";
import { BlackboardData } from "../blackborad/BlackboardData";
import { BlackboardImpl } from "../adapter/resource/BlackboardImpl";
import { BTCompositeNode } from "./BTCompositeNode";
import { URL } from "../../net/URL";
import { BTExecutableNode } from "./BTExecutableNode";
import { TBTNode } from "../datas/types/BehaviorTreeTypes";

export class BehaviorTree {
    /**
     * 行为树根节点
     */
    rootNode: BTCompositeNode;
    /**
     * 黑板数据
     */
    blackboardAsset: BlackboardData;

    nodeMap: Map<any, BTExecutableNode>;

    constructor() {
        this.nodeMap = new Map();
    }

    parse(config: any) {
        let data = config.data;

        for (const key in data) {
            if (key == "root") continue;
            const element: TBTNode = data[key];
            const node = BehaviorTreeFactory.instance.createNew(element) as BTExecutableNode;
            this.append(node, element);
        }

        for (const key in data) {
            const element: TBTNode = data[key];
            if (element.childs) {
                element.childs.forEach((value) => {
                    let node = this.getNodeById(value);
                    if (node) {
                        if (key == "root") this.rootNode = node as BTCompositeNode;
                        else (this.getNodeById(Number(key)) as BTCompositeNode).addChild(node);
                    }
                })
            }
        }
        
        if (config.blackboardAsset)
            this.blackboardAsset = (Laya.loader.getRes(URL.getResURLByUUID(config.blackboardAsset)) as BlackboardImpl).create();
    }

    append(node: BTExecutableNode, item: any) {
        this.nodeMap.set(node.nid, node);
    }

    getNodeById(id: any): BTExecutableNode {
        return this.nodeMap.get(id);
    }
}