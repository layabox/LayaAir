/**
 * 二维点集（可用于表示多边形）
 */
export class PolygonPoint2D {
    private _points: number[] = [];

    constructor(points?: number[]) {
        if (points)
            this._points.push(...points);
    }

    /**
     * @en The points
     * @zh 点集
     */
    get points() {
        return this._points;
    }
    set points(value: number[]) {
        this._points = value;
    }

    /**
     * @en Add point
     * @param x 
     * @param y 
     * @param index Insert position，-1 is to last
     * @zh 添加顶点
     * @param x 
     * @param y 
     * @param index 插入位置，-1代表插入最后
     */
    addPoint(x: number, y: number, index: number = -1) {
        if (index < 0) {
            this._points.push(x, y);
        } else {
            for (let i = this._points.length; i > index; i--)
                this._points[i] = this._points[i - 1];
            this._points[index * 2 + 0] = x;
            this._points[index * 2 + 1] = y;
        }
    }

    /**
     * @en Update point
     * @param x 
     * @param y 
     * @param index Update position
     * @zh 更新顶点
     * @param x 
     * @param y 
     * @param index 更新位置
     */
    updatePoint(x: number, y: number, index: number) {
        if (index < (this._points.length / 2 | 0) && index >= 0) {
            this._points[index * 2 + 0] = x;
            this._points[index * 2 + 1] = y;
        }
    }

    /**
     * @en Remove point
     * @param index Remove position
     * @zh 删除顶点
     * @param index 删除位置
     */
    removePoint(index: number) {
        if (index < this._points.length && index >= 0)
            this._points.splice(index, 1);
    }

    /**
     * @en Clear points
     * @zh 清空顶点
     */
    clear() {
        this._points.length = 0;
    }

    /**
     * @en Clone object
     * @zh 克隆对象
     */
    clone() {
        const poly = new PolygonPoint2D();
        poly._points.push(...this._points);
        return poly;
    }

    /**
     * @en Clone object
     * @param other 
     * @zh 克隆对象
     * @param other 
     */
    cloneTo(other: PolygonPoint2D) {
        other._points.length = 0;
        other._points.push(...this._points);
        return other;
    }
}