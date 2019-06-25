import { IOctreeObject } from "././IOctreeObject";
import { SingletonList } from "../../component/SingletonList";
/**
 * <code>OctreeMotionList</code> 类用于实现物理更新队列。
 */
export declare class OctreeMotionList extends SingletonList {
    /**
     * 创建一个新的 <code>OctreeMotionList</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    add(element: IOctreeObject): void;
    /**
     * @private
     */
    remove(element: IOctreeObject): void;
}
