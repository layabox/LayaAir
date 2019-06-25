import { PhysicsComponent } from "././PhysicsComponent";
import { SingletonList } from "../component/SingletonList";
/**
 * <code>PhysicsUpdateList</code> 类用于实现物理更新队列。
 */
export declare class PhysicsUpdateList extends SingletonList {
    /**
     * 创建一个新的 <code>PhysicsUpdateList</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    add(element: PhysicsComponent): void;
    /**
     * @private
     */
    remove(element: PhysicsComponent): void;
}
