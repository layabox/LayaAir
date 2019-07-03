import { SingletonList } from "./SingletonList";
/**
 * <code>SimpleSingletonList</code> 类用于实现单例队列。
 */
export class SimpleSingletonList extends SingletonList {
    /**
     * 创建一个新的 <code>SimpleSingletonList</code> 实例。
     */
    constructor() {
        super();
    }
    /**
     * @internal
     */
    add(element) {
        var index = element._getIndexInList();
        if (index !== -1)
            throw "SimpleSingletonList:" + element + " has  in  SingletonList.";
        this._add(element);
        element._setIndexInList(this.length++);
    }
    /**
     * @internal
     */
    remove(element) {
        var index = element._getIndexInList();
        this.length--;
        if (index !== this.length) {
            var end = this.elements[this.length];
            this.elements[index] = end;
            end._setIndexInList(index);
        }
        element._setIndexInList(-1);
    }
}
