import { SingletonList } from "../../../utils/SingletonList";
import { Ray } from "../../math/Ray";
import { UI3D } from "./UI3D";

export class UI3DManager {

    _UI3Dlist: SingletonList<UI3D> = new SingletonList<UI3D>();

    constructor() {
    }

    add(value: UI3D) {
        this._UI3Dlist.add(value);
    }

    remove(value: UI3D) {
        this._UI3Dlist.remove(value);
    }

    //需要在
    update() {
        let elements = this._UI3Dlist.elements;
        for (var i = 0, n = this._UI3Dlist.length; i < n; i++) {
            elements[i]._submitRT();
        }
    }

    /**
     * 判断是否碰撞
     */
    rayCast(ray: Ray) {
        let rayOri = ray.origin;
        this._UI3Dlist.clean();
        //sort
        this._UI3Dlist.elements.sort((a: UI3D, b: UI3D) => Number(a._getCameraDistane(rayOri) > b._getCameraDistane(rayOri)));
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
     * Destroy
     */
    destory() {
        this._UI3Dlist.destroy();
    }
}