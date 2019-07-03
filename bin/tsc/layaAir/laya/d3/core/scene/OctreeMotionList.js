import { SingletonList } from "../../component/SingletonList";
/**
 * <code>OctreeMotionList</code> 类用于实现物理更新队列。
 */
export class OctreeMotionList extends SingletonList {
    /**
     * 创建一个新的 <code>OctreeMotionList</code> 实例。
     */
    constructor() {
        super();
    }
    /**
     * @internal
     */
    add(element) {
        var index = element._getIndexInMotionList();
        if (index !== -1)
            throw "OctreeMotionList:element has  in  PhysicsUpdateList.";
        this._add(element);
        element._setIndexInMotionList(this.length++);
    }
    /**
     * @internal
     */
    remove(element) {
        var index = element._getIndexInMotionList();
        this.length--;
        if (index !== this.length) {
            var end = this.elements[this.length];
            this.elements[index] = end;
            end._setIndexInMotionList(index);
        }
        element._setIndexInMotionList(-1);
    }
}
