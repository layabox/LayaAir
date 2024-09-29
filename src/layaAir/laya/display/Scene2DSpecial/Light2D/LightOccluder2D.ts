import { Component } from "../../../components/Component";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Browser } from "../../../utils/Browser";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { LightLine2D } from "./LightLine2D";
import { PolygonPoint2D } from "./PolygonPoint2D";

/**
 * 2D灯光遮挡器（遮光器）
 */
export class LightOccluder2D extends Component {
    /**
     * @internal
     * 遮光器计数器
     */
    static _idCounter: number = 0;

    private _layerMask: number = 1; //层遮罩
    get layerMask(): number {
        return this._layerMask;
    }
    set layerMask(value: number) {
        this._layerMask = value;
    }

    private _canInLight: boolean = true; //如果灯光原点落入遮光器内部，是否挡光
    get canInLight(): boolean {
        return this._canInLight;
    }
    set canInLight(value: boolean) {
        this._canInLight = value;
    }

    private _outside: boolean = true; //是否只是外圈起作用
    get outside(): boolean {
        return this._outside;
    }
    set outside(value: boolean) {
        this._outside = value;
    }

    /**
     * @internal
     * 遮光器Id
     */
    _occluderId: number = 0;

    /**
     * @internal
     * 遮光器范围
     */
    _range: Rectangle = new Rectangle();

    private _offset: Vector2 = new Vector2(); //整体偏移
    private _select: boolean = true; //是否选用

    private _occluderPolygon: PolygonPoint2D;
    private _globalPolygon: PolygonPoint2D;
    private _cutPolygon: PolygonPoint2D;
    private _outsideSegment: number[] = []; //外边缘线段序号（顺时针存储）

    private _tempVec: Vector2 = new Vector2();

    /**
     * @ignore
     */
    constructor() {
        super();
        this._occluderId = LightOccluder2D._idCounter++;
    }

    protected _onEnable(): void {
        super._onEnable();
        (this.owner as Sprite).on("2DtransChanged", this, this._transformChange);
        (this.owner as Sprite).transChangeNotify = true;
        const lightRP = (this.owner?.scene as Scene)?._light2DManager;
        if (lightRP)
            lightRP.addOccluder(this);
    }

    protected _onDisable(): void {
        super._onDisable();
        (this.owner as Sprite).off("2DtransChanged", this, this._transformChange);
        const lightRP = (this.owner?.scene as Scene)?._light2DManager;
        if (lightRP)
            lightRP.removeOccluder(this);
    }

    /**
     * owner的transform发生改变
     */
    protected _transformChange() {
        this._transformPoly();
    }

    /**
     * 设置多边形端点数据
     * @param poly 
     */
    setPolygonPoint(poly: PolygonPoint2D) {
        this._occluderPolygon = poly;
        this._globalPolygon = poly.clone();
        if (!this._cutPolygon)
            this._cutPolygon = new PolygonPoint2D();
        else this._cutPolygon.clear();
        this._transformPoly();
    }

    /**
     * 设置偏移值
     * @param x 
     * @param y 
     */
    setOffset(x: number, y: number) {
        this._offset.x = x;
        this._offset.y = y;
    }

    /**
     * 获取遮光器线段
     * @param segment 
     */
    getSegment(segment: LightLine2D[]) {
        if (this._globalPolygon) {
            const seg = this._outsideSegment;
            const poly = this._globalPolygon.points;
            const half = this._cutPolygon.points;
            const len = poly.length;
            if (!this.outside) {
                if (len > 1) {
                    for (let i = 0; i < len; i++)
                        segment.push(new LightLine2D(poly[i].x, poly[i].y, poly[(i + 1) % len].x, poly[(i + 1) % len].y));
                }
            } else {
                let a = 0;
                if (seg.length > 0) {
                    for (let i = 0, n = seg.length; i < n; i++) {
                        a = seg[i];
                        if (a >= 0)
                            segment.push(new LightLine2D(poly[a].x, poly[a].y, poly[(a + 1) % len].x, poly[(a + 1) % len].y));
                        else {
                            a = (-a - 1) * 2; //转成正常序号
                            segment.push(new LightLine2D(half[a].x, half[a].y, half[a + 1].x, half[a + 1].y));
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取遮光器状态
     */
    getSegmentState() {
        if (this._globalPolygon) {
            const poly = this._globalPolygon.points;
            return poly.length > 1 ? '<' + (poly[0].x | 0) + ',' + (poly[0].y | 0) + ',' + (poly[1].x | 0) + ',' + (poly[1].y | 0) + '>' : '<>';
        }
        return '<>';
    }

    /**
     * 获取范围
     */
    getRange() {
        if (this._globalPolygon) {
            const poly = this._globalPolygon.points;
            let minX = Number.POSITIVE_INFINITY;
            let minY = Number.POSITIVE_INFINITY;
            let maxX = Number.NEGATIVE_INFINITY;
            let maxY = Number.NEGATIVE_INFINITY;
            for (let i = poly.length - 1; i > -1; i--) {
                const p = poly[i];
                if (minX > p.x) minX = p.x;
                if (maxX < p.x) maxX = p.x;
                if (minY > p.y) minY = p.y;
                if (maxY < p.y) maxY = p.y;
            }
            this._range.x = minX;
            this._range.y = minY;
            this._range.width = maxX - minX;
            this._range.height = maxY - minY;
        }
        return this._range;
    }

    /**
     * 按照灯光位置是否被选用，如果灯光位于多边形内部，则不选用
     * @param x 
     * @param y 
     */
    selectByLight(x: number, y: number) {
        if (this._occluderPolygon) {
            if (!this.canInLight) {
                let intersections = 0;
                const poly = this._occluderPolygon.points;
                const len = poly.length;
                const ox = this.owner ? (this.owner as Sprite).globalPosX * Browser.pixelRatio + this._offset.x : this._offset.x;
                const oy = this.owner ? (this.owner as Sprite).globalPosY * Browser.pixelRatio + this._offset.y : this._offset.y;

                for (let i = 0; i < len; i++) {
                    const current = poly[i];
                    const next = poly[(i + 1) % len]; //处理闭合
                    const cx = current.x + ox;
                    const cy = current.y + oy;
                    const nx = next.x + ox;
                    const ny = next.y + oy;

                    //检查水平射线是否由当前点向右延伸
                    if ((cy > y) !== (ny > y)) {
                        //计算线段与射线的交点的 x 坐标
                        const intersectX = ((nx - cx) * (y - cy)) / (ny - cy) + cx;
                        //如果交点在点的右侧，则计数
                        if (x < intersectX)
                            intersections++;
                    }
                }

                //如果交点数是奇数，点在多边形内
                if ((intersections % 2) === 1)
                    this._select = false;
                else this._select = true;
            } else this._select = true;

            //this._transformPoly();
            if (this._select && this.outside)
                this._selectOutside(this._globalPolygon.points, new Vector2(x, y), this._outsideSegment);
        }

        return this._select;
    }

    /**
     * 变换多边形顶点
     */
    private _transformPoly() {
        if (this._globalPolygon) {
            const globalPoly = this._globalPolygon.points;
            const polygon = this._occluderPolygon.points;
            const len = polygon.length;
            const ox = (this.owner ? (this.owner as Sprite).globalPosX + this._offset.x : this._offset.x) * Browser.pixelRatio;
            const oy = (this.owner ? (this.owner as Sprite).globalPosY + this._offset.y : this._offset.y) * Browser.pixelRatio;
            const sx = this.owner ? (this.owner as Sprite).globalScaleX : 1;
            const sy = this.owner ? (this.owner as Sprite).globalScaleY : 1;
            const rotation = this.owner ? (this.owner as Sprite).globalRotation * Math.PI / 180 : 0;
            const pivotX = (this.owner ? (this.owner as Sprite).pivotX : 0) * Browser.pixelRatio;
            const pivotY = (this.owner ? (this.owner as Sprite).pivotY : 0) * Browser.pixelRatio;
            const sinA = Math.sin(rotation);
            const cosA = Math.cos(rotation);
            let x = 0, y = 0;
            for (let i = 0; i < len; i++) {
                x = polygon[i].x * Browser.pixelRatio - pivotX;
                y = polygon[i].y * Browser.pixelRatio - pivotY;
                globalPoly[i].x = (x * cosA - y * sinA) * sx + ox + pivotX;
                globalPoly[i].y = (x * sinA + y * cosA) * sy + oy + pivotY;
            }
        }
    }

    /**
     * 选择外边缘顶点
     * @param polygon 
     * @param outsidePoint 
     * @param outPoly 
     */
    private _selectOutside(polygon: Vector2[], outsidePoint: Vector2, outPoly: number[]) {
        let abX = 0, abY = 0, cdX = 0, cdY = 0, acX = 0, acY = 0, det = 0, t = 0, u = 0;
        const _intersect = (a: Vector2, b: Vector2, c: Vector2, d: Vector2, e: Vector2) => {
            //线段ab的方向向量
            abX = b.x - a.x;
            abY = b.y - a.y;
            //射线cd的方向向量
            cdX = c.x - d.x;
            cdY = c.y - d.y;
            //计算行列式
            det = abX * cdY - abY * cdX;

            //如果行列式为0，则平行或共线
            if (Math.abs(det) < Number.EPSILON) return false;

            //计算参数t和u
            acX = c.x - a.x;
            acY = c.y - a.y;
            t = (acX * cdY - acY * cdX) / det;
            u = (acX * abY - acY * abX) / det;

            //检查t和u是否在有效范围内，并确保交点不是射线的起点
            if (t >= 0 && t <= 1 && u > 0) {
                // 计算交点坐标
                e.x = a.x + t * abX;
                e.y = a.y + t * abY;
                //确保交点不是射线的起点
                if (Math.abs(e.x - c.x) > Number.EPSILON || Math.abs(e.y - c.y) > Number.EPSILON)
                    return true;
            }

            return false;
        }

        outPoly.length = 0; //清空输出数组
        const cutPoly = this._cutPolygon.points;
        cutPoly.length = 0;
        const n = polygon.length;
        const outPoint = this._tempVec;
        let p1: Vector2, p2: Vector2;
        let interP1 = false, interP2 = false;

        for (let i = 0; i < n; i++) {
            p1 = polygon[i];
            p2 = polygon[(i + 1) % n];
            interP1 = false;
            interP2 = false;

            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    if (_intersect(polygon[j], polygon[(j + 1) % n], p1, outsidePoint, outPoint)) {
                        interP1 = true;
                        break;
                    }
                }
            }
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    if (_intersect(polygon[j], polygon[(j + 1) % n], p2, outsidePoint, outPoint)) {
                        interP2 = true;
                        break;
                    }
                }
            }

            if (!interP1 && !interP2)
                outPoly.push(i);
            if (!interP1 && interP2) {
                const inter = this._findNearestIntersection(p1, p2, outsidePoint, polygon);
                if (inter) {
                    cutPoly.push(p1, inter);
                    outPoly.push(-cutPoly.length / 2); //编成负数码
                }
            }
            if (interP1 && !interP2) {
                const inter = this._findNearestIntersection(p2, p1, outsidePoint, polygon);
                if (inter) {
                    cutPoly.push(inter, p2);
                    outPoly.push(-cutPoly.length / 2); //编成负数码
                }
            }
        }
    }

    /**
     * 查找距离p1最近的交点
     * @param p1 
     * @param p2 
     * @param outsidePoint 
     * @param points 
     */
    private _findNearestIntersection(p1: Vector2, p2: Vector2, outsidePoint: Vector2, points: Vector2[]) {
        const _distanceBetween = (v1: Vector2, v2: Vector2) => {
            const dx = v1.x - v2.x;
            const dy = v1.y - v2.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        const _lineIntersection = (p1: Vector2, p2: Vector2, p3: Vector2, p4: Vector2) => {
            const x1 = p1.x, y1 = p1.y;
            const x2 = p2.x, y2 = p2.y;
            const x3 = p3.x, y3 = p3.y;
            const x4 = p4.x, y4 = p4.y;

            const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
            if (denom === 0)
                return null; //线段平行或重合

            const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
            const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

            if (ua <= 0 || ua >= 1 || ub <= 0 || ub >= 1)
                return null; //交点不在线段上，或在端点上

            return new Vector2(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
        }

        let nearestPoint = null;
        let minDistance = Infinity;
        let intersection: Vector2;
        let distance = 0;
        for (let i = points.length - 1; i > -1; i--) {
            intersection = _lineIntersection(p1, p2, outsidePoint, points[i]);
            if (intersection) {
                distance = _distanceBetween(intersection, p1);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPoint = intersection;
                }
            }
        }

        return nearestPoint;
    }
}