import { KeyframeNode2D } from "./KeyframeNode2D";

/**
 * @en A class used to manage 2D keyframe nodes list.
 * @zh 用于管理2D关键帧节点的列表类。
 */
export class KeyframeNodeList2D {
    private _nodes: KeyframeNode2D[] = [];
    /**
     * @en The number of nodes in the list.
     * @zh 列表中的节点个数。
     */
    get count(): number {
        return this._nodes.length;
    }
    set count(value: number) {
        this._nodes.length = value;
    }

    /**
     * @en Retrieves node by its index in the list.
     * @param index The index of the node to retrieve.
     * @returns The node at the specified index.
     * @zh 通过索引获取列表中的节点。
     * @param index 要检索的节点的索引。
     * @returns 指定索引处的节点。
     */
    getNodeByIndex(index: number): KeyframeNode2D {
        return this._nodes[index];
    }

    /**
     * @en Sets a node by its index in the list.
     * @param index The index at which to set the node.
     * @param node The node to set at the specified index.
     * @zh 通过索引设置列表中的节点。
     * @param index 要设置节点的索引。
     * @param node 要设置的节点。
     */

    setNodeByIndex(index: number, node: KeyframeNode2D): void {
        this._nodes[index] = node;
    }
}