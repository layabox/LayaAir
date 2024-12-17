import { Component } from "../../../components/Component";
import { NodeFlags } from "../../../Const";
import { Event } from "../../../events/Event";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Pool } from "../../../utils/Pool";
import { Sprite } from "../../Sprite";
import { Light2DManager } from "./Light2DManager";
import { LightLine2D } from "./LightLine2D";
import { PolygonPoint2D } from "./PolygonPoint2D";

/**
 * 2D灯光遮挡器（遮光器）
 */
export class LightOccluder2D extends Component {
    /**
     * @internal
     */
    static _idCounter: number = 0; //遮光器计数器

    private _layerMask: number = 1; //遮光器层掩码
    private _layers: number[] = [0]; //遮光器层数组

    declare owner: Sprite;

    /**
     * @en the layer mask
     * @zh 遮光器层遮罩（遮光器影响哪些层）
     */
    get layerMask(): number {
        return this._layerMask;
    }
    set layerMask(value: number) {
        if (value !== this._layerMask) {
            this._layerMaskChange(this._layerMask, value);
            this._layerMask = value;

            this._layers.length = 0;
            for (let i = 0; i < Light2DManager.MAX_LAYER; i++)
                if (value & (1 << i))
                    this._layers.push(i);
        }
    }

    /**
     * @en The occluder layers
     * @zh 遮光器层数组
     */
    get layers() {
        return this._layers;
    }

    private _canInLight: boolean = true; //如果灯光原点落入遮光器内部，是否挡光

    /**
     * @en Can in light boolean value
     * @zh 灯光在内部时是否挡光
     */
    get canInLight(): boolean {
        return this._canInLight;
    }
    set canInLight(value: boolean) {
        if (value !== this._canInLight) {
            this._canInLight = value;
            this._needUpdate = true;
        }
    }

    private _outside: boolean = true; //是否只是外圈起作用

    /**
     * @en Only outside shadow the light
     * @zh 获取是否只是外圈遮挡光线
     */
    get outside(): boolean {
        return this._outside;
    }
    set outside(value: boolean) {
        if (value !== this._outside) {
            this._outside = value;
            this._needUpdate = true;
        }
    }

    /**
     * @internal
     */
    _occluderId: number = 0; //遮光器Id，在所有遮光器对象里保持唯一

    /**
     * 遮光器范围（局部坐标）
     */
    private _localRange: Rectangle = new Rectangle();

    /**
     * 遮光器范围（世界坐标）
     */
    private _worldRange: Rectangle = new Rectangle();

    /**
     * @internal
     */
    _needUpdate: boolean = false; //需要更新遮光器

    private _needTransformPoly: boolean = false; //是否需要变换多边形顶点
    private _needUpdateLightLocalRange: boolean = false; //是否需要更新遮光器区域（局部坐标）
    private _needUpdateLightWorldRange: boolean = false; //是否需要更新遮光器区域（世界坐标）

    private _select: boolean = false; //是否选用（如果灯在内部，则可能不选用）

    private _occluderPolygon: PolygonPoint2D; //遮光器多边形（局部坐标）
    private _globalPolygon: PolygonPoint2D; //遮光器多边形（世界坐标）
    private _cutPolygon: PolygonPoint2D; //切割后的多边形
    private _outsideSegment: number[] = []; //外边缘线段序号（顺时针存储）

    private _segments: LightLine2D[] = []; //缓存的线段
    private _segLight: Vector2 = new Vector2(); //缓存线段对应的灯光位置

    private _tempVec2: Vector2 = new Vector2();

    /**
     * @ignore
     */
    constructor() {
        super();
        this._occluderId = LightOccluder2D._idCounter++;
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        this.owner._setBit(NodeFlags.DEMAND_TRANS_EVENT, true);
        this.owner.on(Event.TRANSFORM_CHANGED, this, this._transformChange);
        (this.owner.scene?._light2DManager as Light2DManager)?.addOccluder(this);
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        super._onDisable();
        this.owner.off(Event.TRANSFORM_CHANGED, this, this._transformChange);
        (this.owner.scene?._light2DManager as Light2DManager)?.removeOccluder(this);
    }

    /**
     * @internal
     * 通知此遮光器层的改变
     * @param oldLayerMask 旧层掩码
     * @param newLayerMask 新层掩码
     */
    private _layerMaskChange(oldLayerMask: number, newLayerMask: number) {
        (this.owner?.scene?._light2DManager as Light2DManager)?.occluderLayerMaskChange(this, oldLayerMask, newLayerMask);
    }

    /**
     * 响应矩阵改变
     */
    private _transformChange() {
        this._needUpdate = true;
        this._needTransformPoly = true;
        this._needUpdateLightWorldRange = true;
        (this.owner?.scene?._light2DManager as Light2DManager)?.needCollectOccluderInLight(this.layerMask);
    }

    /**
     * @en Set polygon endpoint data
     * @param poly Polygon data
     * @zh 设置多边形端点数据
     * @param poly 多边形数据
     */
    set polygonPoint(poly: PolygonPoint2D) {
        const light2DManager = this.owner?.scene?._light2DManager as Light2DManager;
        if (poly) {
            this._occluderPolygon = poly;
            this._globalPolygon = poly.clone();
            if (!this._cutPolygon)
                this._cutPolygon = new PolygonPoint2D();
            else this._cutPolygon.clear();
            this._needUpdate = true;
            this._needTransformPoly = true;
            this._needUpdateLightLocalRange = true;
            this._needUpdateLightWorldRange = true;
            light2DManager?.addOccluder(this);
        } else {
            this._occluderPolygon = null;
            this._globalPolygon = null;
            if (this._cutPolygon)
                this._cutPolygon.clear();
            light2DManager?.removeOccluder(this);
        }
        light2DManager?.needCollectOccluderInLight(this.layerMask);
    }

    /**
     * @en Get polygon endpoint data
     * @zh 获取多边形端点数据
     */
    get polygonPoint() {
        return this._occluderPolygon;
    }

    /**
     * 清理缓存
     */
    private _clearCache() {
        const segments = this._segments;
        for (let i = segments.length - 1; i > -1; i--)
            Pool.recover('LightLine2D', segments[i]);
        segments.length = 0;
        this._segLight.x = Number.POSITIVE_INFINITY;
        this._segLight.y = Number.POSITIVE_INFINITY;
    }

    /**
     * @en Get occluder's segments
     * @param lightX Light position x
     * @param lightY Light position y
     * @zh 获取遮光器线段
     * @param lightX 灯光位置x值
     * @param lightY 灯光位置y值
     */
    getSegment(lightX: number, lightY: number) {
        if (this._needTransformPoly) {
            this._needTransformPoly = false;
            this._transformPoly();
        }
        lightX |= 0; //取整，避免缓存误差
        lightY |= 0;
        if (this._segLight.x === lightX && this._segLight.y === lightY) {
            if (Light2DManager.DEBUG)
                console.log('get segments cache', lightX, lightY);
            return this._segments;
        }
        if (this._globalPolygon) {
            const seg = this._outsideSegment;
            const poly = this._globalPolygon.points;
            const half = this._cutPolygon.points;
            const len = poly.length / 2 | 0;
            this._segLight.x = lightX;
            this._segLight.y = lightY;
            const segments = this._segments;
            for (let i = segments.length - 1; i > -1; i--)
                Pool.recover('LightLine2D', segments[i]);
            segments.length = 0;
            if (!this.outside) {
                if (len > 1) {
                    for (let i = 0; i < len; i++) {
                        const index1 = i * 2;
                        const index2 = ((i + 1) % len) * 2;
                        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(poly[index1], poly[index1 + 1], poly[index2], poly[index2 + 1]));
                    }
                }
            } else {
                let a = 0;
                if (seg.length > 0) {
                    for (let i = 0, n = seg.length; i < n; i++) {
                        a = seg[i];
                        if (a >= 0) {
                            const index1 = a * 2;
                            const index2 = ((a + 1) % len) * 2;
                            segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(poly[index1], poly[index1 + 1], poly[index2], poly[index2 + 1]));
                        } else {
                            a = (-a - 1) * 2; //转成正常序号
                            const index1 = a * 2;
                            const index2 = ((a + 1) % len) * 2;
                            segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(half[index1], half[index1 + 1], half[index2], half[index2 + 1]));
                        }
                    }
                }
            }
        }
        if (Light2DManager.DEBUG)
            console.log('calc occluder segments', lightX, lightY);
        return this._segments;
    }

    /**
     * @internal
     * 计算范围（局部坐标）
     */
    private _calcLocalRange() {
        if (this._occluderPolygon) {
            const poly = this._occluderPolygon.points;
            let minX = Number.POSITIVE_INFINITY;
            let minY = Number.POSITIVE_INFINITY;
            let maxX = Number.NEGATIVE_INFINITY;
            let maxY = Number.NEGATIVE_INFINITY;
            for (let i = poly.length - 2; i > -1; i -= 2) {
                const x = poly[i + 0];
                const y = poly[i + 1];
                if (minX > x) minX = x;
                if (maxX < x) maxX = x;
                if (minY > y) minY = y;
                if (maxY < y) maxY = y;
            }
            this._localRange.x = minX;
            this._localRange.y = minY;
            this._localRange.width = maxX - minX;
            this._localRange.height = maxY - minY;
        }
        this._needUpdateLightLocalRange = false;
    }

    /**
     * @internal
     * 计算范围（世界坐标）
     */
    private _calcWorldRange() {
        if (this._needTransformPoly) {
            this._needTransformPoly = false;
            this._transformPoly();
        }
        if (this._globalPolygon) {
            let xmin = Number.POSITIVE_INFINITY;
            let ymin = Number.POSITIVE_INFINITY;
            let xmax = Number.NEGATIVE_INFINITY;
            let ymax = Number.NEGATIVE_INFINITY;
            const polygon = this._globalPolygon.points;
            for (let i = polygon.length - 2; i > -1; i -= 2) {
                const x = polygon[i + 0];
                const y = polygon[i + 1];
                if (xmin > x) xmin = x;
                if (xmax < x) xmax = x;
                if (ymin > y) ymin = y;
                if (ymax < y) ymax = y;
            }
            this._worldRange.x = xmin;
            this._worldRange.y = ymin;
            this._worldRange.width = xmax - xmin;
            this._worldRange.height = ymax - ymin;
        }
        this._needUpdateLightWorldRange = false;
    }

    /**
     * @internal
     * 获取范围（世界坐标）
     */
    _getRange() {
        if (this._needUpdateLightLocalRange)
            this._calcLocalRange();
        if (this._needUpdateLightWorldRange)
            this._calcWorldRange();
        return this._worldRange;
    }

    /**
     * @en Is inside the light range
     * @param range Specified range
     * @zh 是否在指定灯光范围内
     * @param range 指定范围
     */
    isInLightRange(range: Rectangle) {
        return this._getRange().intersection(range);
    }

    /**
     * @en According to whether the light position is selected, if the light is located inside the polygon, it is not selected
     * @param x Light position x
     * @param y Light position y
     * @zh 按照灯光位置是否被选用，如果灯光位于多边形内部，则不选用
     * @param x 灯光位置x值
     * @param y 灯光位置y值
     */
    selectByLight(x: number, y: number) {
        if (this._occluderPolygon) {
            if (!this.canInLight) {
                if (this._needTransformPoly) {
                    this._needTransformPoly = false;
                    this._transformPoly();
                }
                let intersections = 0;
                const poly = this._globalPolygon.points;
                const len = poly.length / 2 | 0;

                for (let i = 0; i < len; i++) {
                    const currentX = poly[i * 2 + 0];
                    const currentY = poly[i * 2 + 1];
                    const nextX = poly[((i + 1) % len) * 2 + 0]; //处理闭合
                    const nextY = poly[((i + 1) % len) * 2 + 1]; //处理闭合
                    const cx = currentX;
                    const cy = currentY;
                    const nx = nextX;
                    const ny = nextY;

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

            if (this._select && this.outside)
                this._selectOutside(this._globalPolygon.points, x, y, this._outsideSegment);
        }

        return this._select;
    }

    /**
     * @internal
     * 变换多边形顶点
     */
    private _transformPoly() {
        if (this._globalPolygon) {
            const globalPoly = this._globalPolygon.points;
            const polygon = this._occluderPolygon.points;
            const len = polygon.length / 2 | 0;
            const ox = this.owner.globalPosX;
            const oy = this.owner.globalPosY;
            const m = this.owner.getGlobalMatrix();
            if (m) {
                for (let i = 0; i < len; i++) {
                    const x = polygon[i * 2 + 0];
                    const y = polygon[i * 2 + 1];
                    globalPoly[i * 2 + 0] = m.a * x + m.c * y + ox;
                    globalPoly[i * 2 + 1] = m.b * x + m.d * y + oy;
                }
            } else {
                const sx = Math.abs(this.owner.globalScaleX);
                const sy = Math.abs(this.owner.globalScaleY);
                for (let i = 0; i < len; i++) {
                    const x = polygon[i * 2 + 0];
                    const y = polygon[i * 2 + 1];
                    globalPoly[i * 2 + 0] = x * sx + ox;
                    globalPoly[i * 2 + 1] = y * sy + oy;
                }
            }
            this._clearCache();
        }
    }

    /**
     * @internal
     * 选择出口边（包括部分出口边）
     * @param polygon 
     * @param outsidePointX 
     * @param outsidePointY 
     * @param outPoly 
     */
    private _selectOutside(polygon: number[], outsidePointX: number, outsidePointY: number, outPoly: number[]) {
        let abX = 0, abY = 0, cdX = 0, cdY = 0, acX = 0, acY = 0, det = 0, t = 0, u = 0;

        //是否相交
        const _intersect = (ax: number, ay: number, bx: number, by: number,
            cx: number, cy: number, dx: number, dy: number, e: Vector2) => {
            //线段ab的方向向量
            abX = bx - ax;
            abY = by - ay;
            //射线cd的方向向量
            cdX = cx - dx;
            cdY = cy - dy;
            //计算行列式
            det = abX * cdY - abY * cdX;

            //如果行列式为0，则平行或共线
            if (Math.abs(det) < Number.EPSILON) return false;

            //计算参数t和u
            acX = cx - ax;
            acY = cy - ay;
            t = (acX * cdY - acY * cdX) / det;
            u = (acX * abY - acY * abX) / det;

            //检查t和u是否在有效范围内，并确保交点不是射线的起点
            if (t >= 0 && t <= 1 && u > 0) {
                // 计算交点坐标
                e.x = ax + t * abX;
                e.y = ay + t * abY;
                //确保交点不是射线的起点
                if (Math.abs(e.x - cx) > Number.EPSILON || Math.abs(e.y - cy) > Number.EPSILON)
                    return true;
            }

            return false;
        }

        //是否顺时针
        const _clockwise = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
            return ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) > 0;
        }

        outPoly.length = 0; //清空输出数组
        const cutPoly = this._cutPolygon.points;
        cutPoly.length = 0;
        const n = polygon.length / 2 | 0;
        const outPoint = this._tempVec2;
        let p1x = 0, p1y = 0, p2x = 0, p2y = 0;
        let interP1 = false, interP2 = false;

        for (let i = 0; i < n; i++) {
            p1x = polygon[i * 2 + 0];
            p1y = polygon[i * 2 + 1];
            p2x = polygon[((i + 1) % n) * 2 + 0];
            p2y = polygon[((i + 1) % n) * 2 + 1];
            interP1 = false;
            interP2 = false;

            //线段的端点和光源必须顺时针排列，否则肯定不是出口边
            if (!_clockwise(p1x, p1y, p2x, p2y, outsidePointX, outsidePointY)) {
                interP1 = true;
                interP2 = true;
            } else {
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        if (_intersect(polygon[j * 2], polygon[j * 2 + 1], polygon[((j + 1) % n) * 2], polygon[((j + 1) % n) * 2 + 1],
                            p1x, p1y, outsidePointX, outsidePointY, outPoint)) {
                            interP1 = true;
                            break;
                        }
                    }
                }
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        if (_intersect(polygon[j * 2], polygon[j * 2 + 1], polygon[((j + 1) % n) * 2], polygon[((j + 1) % n) * 2 + 1],
                            p2x, p2y, outsidePointX, outsidePointY, outPoint)) {
                            interP2 = true;
                            break;
                        }
                    }
                }
            }

            if (!interP1 && !interP2) //两个端点都不和多边形相交，整条边是出口边
                outPoly.push(i);
            if (!interP1 && interP2) {
                const inter = this._findNearestIntersection(p1x, p1y, p2x, p2y, outsidePointX, outsidePointY, polygon);
                if (inter) {
                    cutPoly.push(p1x, p1y, inter.x, inter.y);
                    outPoly.push(-cutPoly.length / 4); //编成负数码
                }
            }
            if (interP1 && !interP2) {
                const inter = this._findNearestIntersection(p2x, p2y, p1x, p1y, outsidePointX, outsidePointY, polygon);
                if (inter) {
                    cutPoly.push(inter.x, inter.y, p2x, p2y);
                    outPoly.push(-cutPoly.length / 4); //编成负数码
                }
            }
        }
    }

    /**
     * @internal
     * 查找距离p1最近的交点
     * @param p1x 
     * @param p1y 
     * @param p2x 
     * @param p2y 
     * @param outsidePointX 
     * @param outsidePointY 
     * @param points 
     */
    private _findNearestIntersection(p1x: number, p1y: number, p2x: number, p2y: number, outsidePointX: number, outsidePointY: number, points: number[]) {
        const _distanceBetween = (v1x: number, v1y: number, v2x: number, v2y: number) => {
            const dx = v1x - v2x;
            const dy = v1y - v2y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        const _lineIntersection = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, p4x: number, p4y: number, out: Vector2) => {
            const x1 = p1x, y1 = p1y;
            const x2 = p2x, y2 = p2y;
            const x3 = p3x, y3 = p3y;
            const x4 = p4x, y4 = p4y;

            const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
            if (denom === 0)
                return false; //线段平行或重合

            const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
            const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

            if (ua <= 0 || ua >= 1 || ub <= 0 || ub >= 1)
                return false; //交点不在线段上，或在端点上

            out.x = x1 + ua * (x2 - x1);
            out.y = y1 + ua * (y2 - y1);
            return true;
        }

        let nearestPoint = null;
        let minDistance = Infinity;
        let intersection = new Vector2();
        let distance = 0;
        for (let i = points.length - 2; i > -1; i -= 2) {
            if (_lineIntersection(p1x, p1y, p2x, p2y, outsidePointX, outsidePointY, points[i], points[i + 1], intersection)) {
                distance = _distanceBetween(intersection.x, intersection.y, p1x, p1y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPoint = intersection;
                }
            }
        }

        return nearestPoint;
    }
}