import { KeyframeNode2D } from "./KeyframeNode2D";

export class KeyframeNodeList2D {
    private _nodes: KeyframeNode2D[] = [];
    /**
    *	节点个数。
    */
    get count(): number {
        return this._nodes.length;
    }
    set count(value: number) {
        this._nodes.length = value;
    }
    /**
     * 通过索引获取节点。
     * @param	index 索引。
     * @return 节点。
     */
    getNodeByIndex(index: number): KeyframeNode2D {
        return this._nodes[index];
    }

    /**
     * 通过索引设置节点。
     * @param	index 索引。
     * @param 节点。
     */
    setNodeByIndex(index: number, node: KeyframeNode2D): void {
        this._nodes[index] = node;
    }
}