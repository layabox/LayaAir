import { Light2DManager } from "./Light2DManager";
import { LightOccluder2DCore } from "./LightOccluder2DCore";
import { PolygonPoint2D } from "./PolygonPoint2D";

/**
 * 创建遮光器的参数结构体
 */
export type Occluder2DParam = {
    poly: PolygonPoint2D | number[]; //多边形对象或数组
    layerMask?: number; //层掩码，默认值1
    px?: number; //位置X坐标，默认值0
    py?: number; //位置Y坐标，默认值0
    sx?: number; //放缩X值，默认值1
    sy?: number; //放缩Y值，默认值1
    rot?: number; //旋转角度，默认值0
};

/**
 * 遮光器代理
 */
export class Occluder2DAgent {
    private _manager: Light2DManager;
    private _occluderMap: Map<number, LightOccluder2DCore> = new Map(); //由代理创建的遮光器内核

    constructor(manager: Light2DManager) {
        this._manager = manager;
    }

    /**
     * @en Create a occluder
     * @param index Unique index
     * @param param Shader parameter object
     * @returns Occluder Object
     * @zh 创建遮光器
     * @param index 唯一索引
     * @param param 遮光器参数对象
     * @returns 遮光器对象
     */
    addOccluder(index: number, param: Occluder2DParam) {
        let polygon: PolygonPoint2D;
        let occluder = this._occluderMap.get(index);
        const poly = param.poly;
        const layerMask = param.layerMask ?? 1;
        const px = param.px ?? 0;
        const py = param.py ?? 0;
        const sx = param.sx ?? 1;
        const sy = param.sy ?? 1;
        const rot = param.rot ?? 0;
        if (poly instanceof Array) {
            polygon = new PolygonPoint2D();
            for (let i = 0, len = poly.length; i < len; i += 2)
                polygon.addPoint(poly[i], poly[i + 1]);
        } else polygon = poly;
        if (!occluder) {
            occluder = new LightOccluder2DCore();
            occluder.manager = this._manager;
            occluder._onEnable();
            this._occluderMap.set(index, occluder);
        }
        occluder.pos(px, py);
        occluder.scale(sx, sy);
        occluder.rotation = rot;
        occluder.polygonPoint = polygon;
        occluder.layerMask = layerMask;
        return occluder;
    }

    /**
     * @zh Get the occluder object
     * @param index Unique index
     * @returns Occluder object (successful), undefined (failed)
     * @zh 获取遮光器
     * @param index 唯一索引
     * @returns 遮光器对象（成功），undefined（失败）
     */
    getOccluder(index: number) {
        return this._occluderMap.get(index);
    }

    /**
     * @en Set the occluder position
     * @param index Unique index
     * @param x X Coordinate value
     * @param y Y Coordinate value
     * @returns Occluder object (successful), undefined (failed)
     * @zh 设置遮光器位置
     * @param index 唯一索引
     * @param x X坐标值
     * @param y Y坐标值
     * @returns 遮光器对象（成功），undefined（失败）
     */
    setPos(index: number, x: number, y: number) {
        const occluder = this._occluderMap.get(index);
        if (occluder)
            occluder.pos(x, y);
        return occluder;
    }

    /**
     * @en Set the occluder rotation
     * @param index Unique index
     * @param rot Rotation angle
     * @returns Occluder object (successful), undefined (failed)
     * @zh 设置遮光器旋转
     * @param index 唯一索引
     * @param rot 旋转角度
     * @returns 遮光器对象（成功），undefined（失败）
     */
    setRot(index: number, rot: number) {
        const occluder = this._occluderMap.get(index);
        if (occluder)
            occluder.rotation = rot;
        return occluder;
    }

    /**
     * @en Set the occluder scale
     * @param index Unique index
     * @param x X scale value
     * @param y Y scale value
     * @returns Occluder object (successful), undefined (failed)
     * @zh 设置遮光器放缩
     * @param index 唯一索引
     * @param x X放缩值
     * @param y Y放缩值
     * @returns 遮光器对象（成功），undefined（失败）
     */
    setScale(index: number, x: number, y: number) {
        const occluder = this._occluderMap.get(index);
        if (occluder)
            occluder.scale(x, y);
        return occluder;
    }

    /**
     * @en Remove the occluder
     * @param index Unique index
     * @returns true (successful), false(failed)
     * @zh 删除指定遮光器
     * @param index 唯一索引
     * @returns true（成功），false（失败）
     */
    removeOccluder(index: number) {
        const occluder = this._occluderMap.get(index);
        if (occluder)
            occluder.destroy();
        return this._occluderMap.delete(index);
    }

    /**
     * @en Clear all occluders
     * @zh 清除所有遮光器
     */
    clearOccluder() {
        this._occluderMap.forEach(occluder => occluder.destroy());
        this._occluderMap.clear();
    }
}