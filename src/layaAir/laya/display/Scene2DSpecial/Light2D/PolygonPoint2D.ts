import { Vector2 } from "../../../maths/Vector2";

/**
 * 二维点集（可用于表示多边形）
 */
export class PolygonPoint2D {
    points: Vector2[] = [];

    constructor(points?: Vector2[]) {
        if (points)
            this.points.push(...points);
    };

    /**
     * 添加灯光顶点
     * @param x 
     * @param y 
     * @param index 
     */
    addPoint(x: number, y: number, index: number = -1) {
        if (index < 0) {
            this.points.push(new Vector2(x, y));
        } else {
            for (let i = this.points.length; i > index; i--)
                this.points[i] = this.points[i - 1];
            this.points[index] = new Vector2(x, y);
        }
    }

    /**
     * 更新灯光顶点
     * @param x 
     * @param y 
     * @param index 
     */
    updatePoint(x: number, y: number, index: number) {
        if (index < this.points.length && index >= 0) {
            this.points[index].x = x;
            this.points[index].y = y;
        }
    }

    /**
     * 删除灯光顶点
     * @param index 
     */
    removePoint(index: number) {
        if (index < this.points.length && index >= 0)
            this.points.splice(index, 1);
    }

    /**
     * 清空
     */
    clear() {
        this.points.length = 0;
    }

    /**
     * 克隆
     */
    clone() {
        const poly = new PolygonPoint2D();
        for (let i = 0, len = this.points.length; i < len; i++)
            poly.points.push(new Vector2(this.points[i].x, this.points[i].y));
        return poly;
    }
}