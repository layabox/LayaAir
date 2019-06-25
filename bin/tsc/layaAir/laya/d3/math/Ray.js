/**
     * <code>Ray</code> 类用于创建射线。
     */
export class Ray {
    /**
     * 创建一个 <code>Ray</code> 实例。
     * @param	origin 射线的起点
     * @param	direction  射线的方向
     */
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
}
