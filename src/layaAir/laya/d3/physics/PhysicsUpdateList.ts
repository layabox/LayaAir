import { ICollider } from "../../Physics3D/interface/ICollider";
import { SingletonList } from "../../utils/SingletonList";

/**
 * @en The `PhysicsUpdateList` class is used to manage the physics update queue.
 * @zh `PhysicsUpdateList` 类用于实现物理更新队列。
 */
export class PhysicsUpdateList extends SingletonList<ICollider> {
    /** @ignore */
    constructor() {
        super();

    }

    /**
     * @internal
     * @en Adds an element to the physics update list.
     * @param element The collider element to add.
     * @zh 将元素添加到物理更新列表中。
     * @param element 要添加的碰撞器元素。
     */
    add(element: ICollider): void {
        var index: number = element.inPhysicUpdateListIndex;
        if (index !== -1)
            console.error("PhysicsUpdateList:element has  in  PhysicsUpdateList.");
        this._add(element);
        element.inPhysicUpdateListIndex = this.length++;
    }

    /**
     * @internal
     * @en Removes an element from the physics update list.
     * @param element The collider element to remove.
     * @zh 从物理更新列表中移除元素。
     * @param element 要移除的碰撞器元素。
     */
    remove(element: ICollider): void {
        var index: number = element.inPhysicUpdateListIndex;
        if (index != -1 && index < this.length) {
            this.length--;
            var end: any = this.elements[this.length];
            this.elements[index] = end;
            end.inPhysicUpdateListIndex = index;
        }
        element.inPhysicUpdateListIndex = -1;
    }

}


