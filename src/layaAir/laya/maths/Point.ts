import { Pool } from "../utils/Pool"

/**
 * @en The `Point` object represents a location in a two-dimensional coordinate system, where x represents the horizontal axis and y represents the vertical axis.
 * @zh `Point` 对象表示二维坐标系统中的某个位置，其中 x 表示水平轴，y 表示垂直轴。
 */
export class Point {

    /**
     * @en Temporary public object for reuse.
     * @zh 临时使用的公用对象。
     */
    static TEMP: Point = new Point();
    /**
     * @private
     * @en Global empty point object (x=0, y=0), the content of this object is not allowed to be modified.
     * @zh 全局空的point对象(x=0，y=0)，不允许修改此对象内容。
     */
    static EMPTY: Point = new Point();

    /**
     * @en The horizontal coordinate of this point.
     * @zh 该点的水平坐标。
     */
    x: number;
    /**
     * @en The vertical coordinate of this point.
     * @zh 该点的垂直坐标。
     */
    y: number;

    /**
     * @en Creates a new Point object based on the specified coordinates.
     * @param x The horizontal coordinate. Default is 0.
     * @param y The vertical coordinate. Default is 0.
     * @zh 根据指定坐标，创建一个新的 Point 对象。
     * @param x 水平坐标。默认值为0。
     * @param y 垂直坐标。默认值为0。
     */
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * @en Create from object pool
     * @returns A Point object from the pool
     * @zh 从对象池创建
     * @returns 从对象池中获取的Point对象
     */
    static create(): Point {
        return Pool.getItemByClass("Point", Point);
    }

    /**
     * @en Sets the members of Point to the specified values.
     * @param x The horizontal coordinate.
     * @param y The vertical coordinate.
     * @returns The current Point object.
     * @zh 将 Point 的成员设置为指定值。
     * @param x 水平坐标。
     * @param y 垂直坐标。
     * @returns 当前 Point 对象。
     */
    setTo(x: number, y: number): Point {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * @en Reset the point to (0, 0)
     * @returns The current Point object.
     * @zh 重置点为(0, 0)
     * @returns 当前 Point 对象。
     */
    reset(): Point {
        this.x = this.y = 0;
        return this;
    }

    /**
     * @en Recycle to the object pool for reuse
     * @zh 回收到对象池，方便复用
     */
    recover(): void {
        Pool.recover("Point", this.reset());
    }

    /**
     * @en Calculate the distance between the current point and the target point (x, y).
     * @param x The horizontal coordinate of the target point.
     * @param y The vertical coordinate of the target point.
     * @returns The distance between the current point and the target point.
     * @zh 计算当前点和目标点(x，y)的距离。
     * @param x 目标点的水平坐标。
     * @param y 目标点的垂直坐标。
     * @returns 返回当前点和目标点之间的距离。
     */
    distance(x: number, y: number): number {
        return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
    }

    /**
     * @en Returns a string that contains the values of the x and y coordinates.
     * @zh 返回包含 x 和 y 坐标的值的字符串。
     */
    toString(): string {
        return this.x + "," + this.y;
    }

    /**
     * @en Normalize the vector.
     * @zh 标准化向量。
     */
    normalize(): void {
        var d: number = Math.sqrt(this.x * this.x + this.y * this.y);
        if (d > 0) {
            var id: number = 1.0 / d;
            this.x *= id;
            this.y *= id;
        }
    }

    /**
     * @en Copy coordinates from another point
     * @param point The point to be copied from
     * @returns The current Point object.
     * @zh 复制另一个点的坐标
     * @param point 需要被复制的点
     * @returns 当前 Point 对象。
     */
    copy(point: Point): Point {
        return this.setTo(point.x, point.y);
    }
}

