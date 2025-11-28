
/**
 * @en The `SingletonList` class is designed to implement a singleton queue.
 * @zh SingletonList 类用于实现单例队列。
 */
export class SingletonList<T> {
    /**
     * @en [Read-only] The array storing the elements of the queue.
     * @zh [只读] 存储队列元素的数组。
     */
    elements: Array<T> = [];
    /**
     * @en [Read-only] The current length of the queue.
     * @zh [只读] 队列的当前长度。
     */
    length: number = 0;

    /**
     * @en Adds an element to the list if it is not already present.
     * @param element The element to add.
     * @zh 如果元素尚未存在于列表中，则添加该元素。
     * @param element 要添加的元素。
     */
    add(element: T): void {
        let index = this.elements.indexOf(element);
        if (index != -1 && index < this.length)
            return;

        this.elements[this.length++] = element;
    }

    /**
     * @en Adds all elements from another SingletonList to this list.
     * @param list The SingletonList containing elements to add.
     * @zh 将另一个 SingletonList 中的所有元素添加到此列表中。
     * @param list 要添加元素的 SingletonList。
     */
    addList(list: SingletonList<T>): void {
        let len = this.length;
        let len2 = list.length;
        this.length = len + len2;
        let arr1 = this.elements;
        let arr2 = list.elements;
        if (arr1.length < this.length)
            arr1.length = this.length;
        for (let i = 0; i < len2; i++) {
            arr1[len + i] = arr2[i];
        }
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
     * @en Removes an element from the list.
     * @param element The element to remove.
     * @zh 从列表中移除一个元素。
     * @param element 要移除的元素。
     */
    remove(element: T): void {
        let index = this.elements.indexOf(element);
        if (index != -1 && index < this.length) {
            this.elements[index] = this.elements[this.length - 1];
            this.elements[this.length - 1] = null;//去掉引用
            this.length--;
        }

    }

    /**
     * @en Clears the list, removing all elements.
     * @zh 清除列表，移除所有元素。
     */
    clear() {
        this.elements.length = 0;
        this.length = 0;
    }

    /**
     * @en Trims the elements array to match the current length of the list.
     * @zh 将元素数组的长度调整为与列表的当前长度相匹配。
     */
    clean() {
        this.elements.length = this.length;
    }

    cloneTo(out: SingletonList<T>) {
        out.length = this.length;
        out.elements = this.elements.slice();
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
    add(element: T): void {
        this.elements[this.length++] = element;
    }
}


