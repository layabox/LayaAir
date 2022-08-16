import { SingletonList } from "./SingletonList";

export interface ISingletonElement {
    _indexInList: number;
}

/**
 * <code>SimpleSingletonList</code> 类用于实现单例队列。
 */
export class SimpleSingletonList<T extends ISingletonElement> extends SingletonList<T> {
    /**
     * 创建一个新的 <code>SimpleSingletonList</code> 实例。
     */
    constructor() {
        super();
    }

    /**
     * @internal
     */
    add(element: T): void {
        let index = element._indexInList;
        if (index !== -1) {
            console.error("SimpleSingletonList:" + element + " has  in  SingletonList.");
            return;
        }
        this._add(element);
        element._indexInList = this.length++;
    }

    /**
     * @internal
     */
    remove(element: T): void {
        let index: number = element._indexInList;
        this.length--;
        if (index !== this.length) {
            let end = this.elements[this.length];
            this.elements[index] = end;
            end._indexInList = index;
        }
        element._indexInList = -1;
    }

    /**
     * @internal
     */
    clear(): void {
        let elements = this.elements;
        for (let i = 0, n = this.length; i < n; i++)
            elements[i]._indexInList = -1;
        this.length = 0;
    }

    clearElement() {
        this.elements = null;
        this.length = 0;
    }
}
