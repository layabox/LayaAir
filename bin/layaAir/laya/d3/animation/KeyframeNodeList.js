/**
     * <code>KeyframeNodeList</code> 类用于创建KeyframeNode节点队列。
     */
export class KeyframeNodeList {
    /**
     * 创建一个 <code>KeyframeNodeList</code> 实例。
     */
    constructor() {
        /**@private */
        this._nodes = [];
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
    }
    /**
     *	获取节点个数。
     * @return 节点个数。
     */
    get count() {
        return this._nodes.length;
    }
    /**
     * 设置节点个数。
     * @param value 节点个数。
     */
    set count(value) {
        this._nodes.length = value;
    }
    /**
     * 通过索引获取节点。
     * @param	index 索引。
     * @return 节点。
     */
    getNodeByIndex(index) {
        return this._nodes[index];
    }
    /**
     * 通过索引设置节点。
     * @param	index 索引。
     * @param 节点。
     */
    setNodeByIndex(index, node) {
        this._nodes[index] = node;
    }
}
