import { KeyframeNode } from "./KeyframeNode";

/**
 * @en The KeyframeNodeList class is used to create a queue of KeyframeNode nodes.
 * @zh KeyframeNodeList 类用于创建 KeyframeNode 节点队列。
 */
export class KeyframeNodeList {
	/** @internal */
	private _nodes: KeyframeNode[] = [];

	/**
	 * @en The number of nodes.
	 * @zh 节点个数。
	 */
	get count(): number {
		return this._nodes.length;
	}

	set count(value: number) {
		this._nodes.length = value;
	}

	/**
	 * @ignore
	 * @en Creates an instance of KeyframeNodeList.
	 * @zh 创建一个KeyframeNodeList实例。
	 */
	constructor() {
	}

	/**
	 * @en Get a node by its index.
	 * @param index The index of the node.
	 * @returns The KeyframeNode at the specified index.
	 * @zh 通过索引获取节点。
	 * @param index 索引。
	 * @returns 指定索引处的 KeyframeNode 节点。
	 */
	getNodeByIndex(index: number): KeyframeNode {
		return this._nodes[index];
	}

	/**
	 * @en Set a node at the specified index.
	 * @param index The index at which to set the node.
	 * @param node The KeyframeNode to set.
	 * @zh 通过索引设置节点。
	 * @param index 索引。
	 * @param node 要设置的 KeyframeNode 节点。
	 */
	setNodeByIndex(index: number, node: KeyframeNode): void {
		this._nodes[index] = node;
	}

}
