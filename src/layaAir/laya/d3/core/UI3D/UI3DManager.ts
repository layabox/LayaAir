import { FastSinglelist } from "../../../utils/SingletonList";
import { Ray } from "../../math/Ray";
import { UI3D } from "./UI3D";

/**
 * @en UI3DManager calss is used to create 3D UI manager, which manages all 3D UI objects.
 * @zh UI3DManager 类用于创建3D-UI管理器，管理所有3D-UI对象。
 */
export class UI3DManager {

    /**
     * @en A list to store 3D UI elements.
     * @zh 存储3D-UI元素的列表。
     */
    _UI3Dlist: FastSinglelist<UI3D> = new FastSinglelist<UI3D>();

    /** @ignore */
    constructor() {
    }

    /**
     * @en Adds a 3D UI element to the manager.
     * @param value The 3D UI element to add.
     * @zh 向管理器添加一个3D-UI元素。
     * @param value 要添加的3D-UI元素。
     */
    add(value: UI3D) {
        this._UI3Dlist.add(value);
    }

    /**
     * @en Removes a 3D UI element from the manager.
     * @param value The 3D UI element to remove.
     * @zh 从管理器中移除一个3D-UI元素。
     * @param value 要移除的3D-UI元素。
     */
    remove(value: UI3D) {
        this._UI3Dlist.remove(value);
    }

    /**
     * @en Updates the 3D UI elements in the scene.
     * @zh 更新场景中的3D-UI元素。
     */
    update() {
        let elements = this._UI3Dlist.elements;
        for (var i = 0, n = this._UI3Dlist.length; i < n; i++) {
            elements[i]._submitRT();
        }
    }

    /**
     * @en Performs a ray cast to determine if there is a collision with any 3D UI elements.
     * @param ray The ray for the ray casting.
     * @returns The hit result or null if no collision occurs.
     * @zh 执行射线投射以判断是否与任何3D-UI元素发生碰撞。
     * @param ray 射线投射的射线。
     * @returns 返回碰撞结果或如果没有碰撞发生则返回null。
     */
    rayCast(ray: Ray): any {
        let rayOri = ray.origin;
        this._UI3Dlist.clean();
        //sort
        this._UI3Dlist.elements.sort(
            (a: UI3D, b: UI3D) => {
                return a._getCameraDistance(rayOri) - b._getCameraDistance(rayOri);
            }
        );
        let elements = this._UI3Dlist.elements;
        for (var i = 0, n = this._UI3Dlist.length; i < n; i++) {
            let hit = elements[i]._checkUIPos(ray);
            if (hit) {//遮挡
                return hit;
            }
        }
        return null;
    }

    /**
     * @en Destroys the 3D UI elements managed by the list.
     * @zh 销毁列表中存储的3D-UI元素。
     */
    destory() {
        this._UI3Dlist.destroy();
    }
}