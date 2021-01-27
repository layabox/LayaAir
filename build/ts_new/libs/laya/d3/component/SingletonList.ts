
/**
 * <code>SingletonList</code> 类用于实现单例队列。
 */
export class SingletonList<T> {
	/**@internal [只读]*/
	elements: Array<T> = [];
	/** @internal [只读]*/
	length: number = 0;

	/**
	 * 创建一个新的 <code>SingletonList</code> 实例。
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	protected _add(element: T): void {
		if (this.length === this.elements.length)
			this.elements.push(element);
		else
			this.elements[this.length] = element;
	}

	/**
	 * @internal
	 */
	public add(element: T): void {
		if (this.length === this.elements.length)
			this.elements.push(element);
		else
			this.elements[this.length] = element;
		this.length++;
	}

}


