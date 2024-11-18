/**
 * 二维点集（可用于表示多边形）
 */
export class PolygonPoint2D {
    private _points: number[] = [];

    constructor(points?: number[]) {
        if (points)
            this.points.push(...points);
    }

    /**
     * @en get points
     * @zh 获取点集
     */
    get points(): number[] {
        return this._points;
    }

    /**
     * @en set points
     * @zh 设置点集
     */
    set points(value: number[]) {
        this._points = value;
    }

    /**
     * @en add point
     * @zh 添加顶点
     * @param x 
     * @param y 
     * @param index 
     */
    addPoint(x: number, y: number, index: number = -1) {
        if (index < 0) {
            this.points.push(x, y);
        } else {
            for (let i = this.points.length; i > index; i--)
                this.points[i] = this.points[i - 1];
            this.points[index * 2 + 0] = x;
            this.points[index * 2 + 1] = y;
        }
    }

    /**
     * @en update point
     * @zh 更新顶点
     * @param x 
     * @param y 
     * @param index 
     */
    updatePoint(x: number, y: number, index: number) {
        if (index < (this.points.length / 2 | 0) && index >= 0) {
            this.points[index * 2 + 0] = x;
            this.points[index * 2 + 1] = y;
        }
    }

    /**
     * @en remove point
     * @zh 删除顶点
     * @param index 
     */
    removePoint(index: number) {
        if (index < this.points.length && index >= 0)
            this.points.splice(index, 1);
    }

    /**
     * @en clear points
     * @zh 清空顶点
     */
    clear() {
        this.points.length = 0;
    }

    /**
     * @en clone object
     * @zh 克隆对象
     */
    clone() {
        const poly = new PolygonPoint2D();
        poly.points.push(...this.points);
        return poly;
    }

    /**
     * @en clone object
     * @zh 克隆对象
     */
    cloneTo(other: PolygonPoint2D) {
        const p = this._points;
        const op = other._points;
        const len = p.length;
        op.length = len;
        for (let i = 0; i < len; i++)
            op[i] = p[i];
        return other;
    }
}