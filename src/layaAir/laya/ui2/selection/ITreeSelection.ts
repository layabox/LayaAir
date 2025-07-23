import { TreeClickToExpandType } from "../Const";
import type { GTreeNode } from "../GTreeNode";
import { ISelection } from "./ISelection";

export interface ITreeSelection extends ISelection {
    /**
     * @en Whether to automatically expand or collapse the folder node when clicking on it.
     * @zh 点击文件夹节点时是否自动展开或者折叠这个这个节点。
     */
    get clickToExpand(): TreeClickToExpandType;
    set clickToExpand(value: TreeClickToExpandType);

    /**
     * @en Get the currently selected node.
     * @zh 获取当前选中的节点。
     */
    getSelectedNode(): GTreeNode;

    /**
     * @en Get the currently selected nodes.
     * @param out An optional array to store the selected nodes.
     * @returns The currently selected nodes.
     * @zh 获取当前选中的节点列表。
     * @param out 可选的数组，用于存储选中的节点。
     * @returns 返回当前选中的节点列表。
     */
    getSelectedNodes(out?: Array<GTreeNode>): Array<GTreeNode>;

    /**
     * @en Select a node in the tree.
     * @param node The node to select.
     * @param scrollItToView Whether to scroll the selected node into view.
     * @zh 选择树中的节点。
     * @param node 要选择的节点。
     * @param scrollItToView 是否将选中的节点滚动到视图中
     */
    selectNode(node: GTreeNode, scrollItToView?: boolean): void;

    /**
     * @en Unselect a node in the tree.
     * @param node The node to unselect.
     * @zh 取消选择树中的节点。
     * @param node 要取消选择的节点。 
     */
    unselectNode(node: GTreeNode): void;
}