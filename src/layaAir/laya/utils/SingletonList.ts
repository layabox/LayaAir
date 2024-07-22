
/**
 * @en The `SingletonList` class is designed to implement a singleton queue.
 * @zh SingletonList 类用于实现单例队列。
 */
export class SingletonList<T> {
    /**
     * @internal
     * @en [Read-only] The array storing the elements of the queue.
     * @zh [只读] 存储队列元素的数组。
     */
    elements: Array<T> = [];
    /**
     * @internal
     * @en [Read-only] The current length of the queue.
     * @zh [只读] 队列的当前长度。
     */
    length: number = 0;

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
     * @en Adds an element to the list if it is not already present.
     * @param element The element to add.
     * @zh 如果元素尚未存在于列表中，则添加该元素。
     * @param element 要添加的元素。
     */
    add(element: T): void {
        let index = this.elements.indexOf(element);
        if ((typeof (element) != "number") && index != -1 && index < this.length)
            return;
        if (this.length === this.elements.length)
            this.elements.push(element);
        else
            this.elements[this.length] = element;
        this.length++;
    }

    /**
     * @en Finds the index of an element in the list.
     * @param element The element to find.
     * @zh 在列表中查找元素的索引。
     * @param element 要查找的元素。
     */
    indexof(element: T) {
        let index = this.elements.indexOf(element);
        if (index != -1 && index < this.length)
            return index;
        return -1;
    }

    /**
     * @internal
     * @en Removes an element from the list.
     * @param element The element to remove.
     * @zh 从列表中移除一个元素。
     * @param element 要移除的元素。
     */
    remove(element: T): void {
        let index = this.elements.indexOf(element);
        if (index != -1 && index < this.length) {
            this.elements[index] = this.elements[this.length - 1];
            this.length--;
        }

    }

    /**
     * @internal
     * @en Clears the list, removing all elements.
     * @zh 清除列表，移除所有元素。
     */
    clear() {
        this.elements = [];
        this.length = 0;
    }

    /**
     * @internal
     * @en Trims the elements array to match the current length of the list.
     * @zh 将元素数组的长度调整为与列表的当前长度相匹配。
     */
    clean() {
        this.elements.length = this.length;
    }

    /**
     * @en Destroys the list by nullifying the elements array.
     * @zh 通过将元素数组置为 null 来销毁列表。
     */
    destroy() {
        this.elements = null;
    }
}

export class FastSinglelist<T> extends SingletonList<T> {

    /**
     * @internal
     */
    add(element: T): void {
        this._add(element);
        this.length++;
    }

}


