import { KeyframeNode } from "./KeyframeNode";

/**
 * <code>KeyframeNodeList</code> 类用于创建KeyframeNode节点队列。
 */
export class KeyframeNodeList {
	/** @internal */
	private _nodes: KeyframeNode[] = [];

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
	 * 创建一个 <code>KeyframeNodeList</code> 实例。
	 */
	constructor() {
	}

	/**
	 * 通过索引获取节点。
	 * @param index 索引。
	 */
	getNodeByIndex(index: number): KeyframeNode {
		return this._nodes[index];
	}

	/**
	 * 通过索引设置节点。
	 * @param index 索引。
	 * @param node 节点。
	 */
	setNodeByIndex(index: number, node: KeyframeNode): void {
		this._nodes[index] = node;
	}

}
