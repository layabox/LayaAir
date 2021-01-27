import { Pool } from "../utils/Pool"

/**
 * <code>Point</code> 对象表示二维坐标系统中的某个位置，其中 x 表示水平轴，y 表示垂直轴。
 */
export class Point {

    /**临时使用的公用对象。*/
    static TEMP: Point = new Point();
    /**@private 全局空的point对象(x=0，y=0)，不允许修改此对象内容*/
    static EMPTY: Point = new Point();

    /**该点的水平坐标。*/
    x: number;
    /**该点的垂直坐标。*/
    y: number;

    /**
     * 根据指定坐标，创建一个新的 <code>Point</code> 对象。
     * @param x	（可选）水平坐标。
     * @param y	（可选）垂直坐标。
     */
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 从对象池创建
     */
    static create(): Point {
        return Pool.getItemByClass("Point", Point);
    }

    /**
     * 将 <code>Point</code> 的成员设置为指定值。
     * @param	x 水平坐标。
     * @param	y 垂直坐标。
     * @return 当前 Point 对象。
     */
    setTo(x: number, y: number): Point {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 重置
     */
    reset(): Point {
        this.x = this.y = 0;
        return this;
    }

    /**
     * 回收到对象池，方便复用
     */
    recover(): void {
        Pool.recover("Point", this.reset());
    }

    /**
     * 计算当前点和目标点(x，y)的距离。
     * @param	x 水平坐标。
     * @param	y 垂直坐标。
     * @return	返回当前点和目标点之间的距离。
     */
    distance(x: number, y: number): number {
        return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
    }

    /**返回包含 x 和 y 坐标的值的字符串。*/
    toString(): string {
        return this.x + "," + this.y;
    }

    /**
     * 标准化向量。
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
     * copy point坐标
     * @param	point 需要被copy的point
     */
    copy(point: Point): Point {
        return this.setTo(point.x, point.y);
    }
}

