/**
 * <code>SingletonList</code> 类用于实现单例队列。
 */
export class SingletonList {
    /**
     * 创建一个新的 <code>SingletonList</code> 实例。
     */
    constructor() {
        /**@private [只读]*/
        this.elements = [];
        /** @private [只读]*/
        this.length = 0;
    }
    /**
     * @private
     */
    _add(element) {
        if (this.length === this.elements.length)
            this.elements.push(element);
        else
            this.elements[this.length] = element;
    }
}
