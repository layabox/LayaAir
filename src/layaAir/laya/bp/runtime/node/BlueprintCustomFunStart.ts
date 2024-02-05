import { INodeManger } from "../../core/interface/INodeManger";
import { TBPEventProperty, TBPNode } from "../../datas/types/BlueprintTypes";
import { BlueprintEventNode } from "./BlueprintEventNode";

export class BlueprintCustomFunStart extends BlueprintEventNode {
    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintEventNode>) {
        if (node.dataId) {
            this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
        }
        else {
            this.eventName = node.name;
        }
    }

}