import { SingletonList } from "../../../../utils/SingletonList";
import { IBoundsCell } from "../../../math/IBoundsCell";
import { BVHSpatialBox } from "./BVHSpatialBox";

/**
 * 接受空间分割管理的逻辑对象   容器
 */
export class BVHSpatialManager {
    /**@internal */
    bvhManager: Map<number, BVHSpatialBox<IBoundsCell>>;

    /**@internal */
    cellCount: number = 0;

    /**@internal */
    updateBVHBoxList: SingletonList<BVHSpatialBox<IBoundsCell>>;

    /**
     * 实例化BVHSpatialManager
     */
    constructor() {
        this.bvhManager = new Map();
        this.updateBVHBoxList = new SingletonList<BVHSpatialBox<IBoundsCell>>();
    }

    /**
     * clear
     */
    clear() {
        this.cellCount = 0;
        this.updateBVHBoxList.clear();
    }

    /**
     * destroy
     */
    destroy() {
        this.bvhManager = null;
        this.updateBVHBoxList.destroy();
    }
}

/**
 * BVHConfig
 */
export class BVHSpatialConfig {
    /**@internal 一个BVH节点最大的cell数，超过这个数会分离*/
    public max_SpatialCount = 7;
    /**@internal 最大BVH节点的大小*/
    public limit_size = 32;
    /**@internal 最小cellbuild数，如果小于这个数，不会BVH构建*/
    public Min_BVH_Build_Nums = 10;
}