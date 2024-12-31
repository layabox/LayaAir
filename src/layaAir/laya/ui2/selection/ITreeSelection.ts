import { TreeClickToExpandType } from "../Const";
import type { GTreeNode } from "../GTreeNode";
import { ISelection } from "./ISelection";

export interface ITreeSelection extends ISelection {
    get clickToExpand(): TreeClickToExpandType;
    set clickToExpand(value: TreeClickToExpandType);

    getSelectedNode(): GTreeNode;
    getSelectedNodes(out?: Array<GTreeNode>): Array<GTreeNode>;
    selectNode(node: GTreeNode, scrollItToView?: boolean): void;
    unselectNode(node: GTreeNode): void;
}