import { ICollider } from "../../Physics3D/interface/ICollider";
import { SingletonList } from "../../utils/SingletonList";

/**
 * <code>PhysicsUpdateList</code> 类用于实现物理更新队列。
 */
export class PhysicsUpdateList extends SingletonList<ICollider> {

    /**
     * 创建一个新的 <code>PhysicsUpdateList</code> 实例。
     */
    constructor() {
        super();

    }

    /**
     * @internal
     */
    add(element: ICollider): void {
        var index: number = element.inPhysicUpdateListIndex;
        if (index !== -1)
            throw "PhysicsUpdateList:element has  in  PhysicsUpdateList.";
        this._add(element);
        element.inPhysicUpdateListIndex = this.length++;
    }

    /**
     * @internal
     */
    remove(element: ICollider): void {
        var index: number = element.inPhysicUpdateListIndex;
        this.length--;
        if (index !== this.length) {
            var end: any = this.elements[this.length];
            this.elements[index] = end;
            end._inPhysicUpdateListIndex = index;
        }
        element.inPhysicUpdateListIndex = -1;
    }

}


