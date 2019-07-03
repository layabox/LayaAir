/**
 * <code>SingletonList</code> 类用于实现单例队列。
 */
export class SingletonList {
    /**
     * 创建一个新的 <code>SingletonList</code> 实例。
     */
    constructor() {
        /**@internal [只读]*/
        this.elements = [];
        /** @internal [只读]*/
        this.length = 0;
    }
    /**
     * @internal
     */
    _add(element) {
        if (this.length === this.elements.length)
            this.elements.push(element);
        else
            this.elements[this.length] = element;
    }
}
