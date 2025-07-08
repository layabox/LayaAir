/**
 * @en StretchParam is a class that defines stretch parameters for layout.
 * @zh StretchParam 是一个定义布局拉伸参数的类。
 */
export class StretchParam {
    /**
     * @en The ratio of stretch.
     * @zh 拉伸的比例。
     */
    ratio: number = 0;
    /**
     * @en The priority of the stretch.
     * @zh 拉伸的优先级。
     */
    priority: number = 0;
    /**
     * @en The minimum size for the stretch.
     * @zh 拉伸的最小尺寸。
     */
    min: number = 0;
    /**
     * @en The maximum size for the stretch.
     * @zh 拉伸的最大尺寸。
     */
    max: number = 0;
    /**
     * @en Whether the size is fixed.
     * @zh 是否固定大小。
     */
    fixed: boolean;

    /** @ignore */
    setRatio(value: number) {
        this.ratio = value;
        return this;
    }

    /** @ignore */
    setPriority(value: number) {
        this.priority = value;
        return this;
    }

    /** @ignore */
    setLimit(min: number, max: number) {
        this.min = min;
        this.max = max;
        return this;
    }

    /** @ignore */
    setFixed() {
        this.fixed = true;
        return this;
    }
}