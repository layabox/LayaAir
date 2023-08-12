import { SingletonList } from "../../utils/SingletonList";
import { btCollider } from "./Collider/btCollider";

/**
 * <code>PhysicsUpdateList</code> 类用于实现物理更新队列。
 */
export class PhysicsUpdateList extends SingletonList<btCollider> {

    /**
     * 创建一个新的 <code>PhysicsUpdateList</code> 实例。
     */
    constructor() {
        super();

    }

    /**
     * @internal
     */
    add(element: btCollider): void {
        var index: number = element._inPhysicUpdateListIndex;
        if (index !== -1)
            throw "PhysicsUpdateList:element has  in  PhysicsUpdateList.";
        this._add(element);
        element._inPhysicUpdateListIndex = this.length++;
    }

    /**
     * @internal
     */
    remove(element: btCollider): void {
        var index: number = element._inPhysicUpdateListIndex;
        this.length--;
        if (index !== this.length) {
            var end: any = this.elements[this.length];
            this.elements[index] = end;
            end._inPhysicUpdateListIndex = index;
        }
        element._inPhysicUpdateListIndex = -1;
    }

}


