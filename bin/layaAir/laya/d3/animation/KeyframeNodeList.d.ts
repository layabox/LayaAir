import { KeyframeNode } from "./KeyframeNode";
/**
     * <code>KeyframeNodeList</code> 类用于创建KeyframeNode节点队列。
     */
export declare class KeyframeNodeList {
    /**@private */
    private _nodes;
    /**
     *	获取节点个数。
     * @return 节点个数。
     */
    /**
    * 设置节点个数。
    * @param value 节点个数。
    */
    count: number;
    /**
     * 创建一个 <code>KeyframeNodeList</code> 实例。
     */
    constructor();
    /**
     * 通过索引获取节点。
     * @param	index 索引。
     * @return 节点。
     */
    getNodeByIndex(index: number): KeyframeNode;
    /**
     * 通过索引设置节点。
     * @param	index 索引。
     * @param 节点。
     */
    setNodeByIndex(index: number, node: KeyframeNode): void;
}
