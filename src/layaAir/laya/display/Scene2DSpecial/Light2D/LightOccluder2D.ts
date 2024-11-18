import { Component } from "../../../components/Component";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Browser } from "../../../utils/Browser";
import { Pool } from "../../../utils/Pool";
import { Scene } from "../../Scene";
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
     * 遮光器计数器
     */
    static _idCounter: number = 0;

    private _layerMask: number = 1; //遮光器层掩码（哪些层有遮光器）
    private _layers: number[] = [0]; //遮光器层数组（哪些层有遮光器）

    /**
     * @en Get layer mask
     * @zh 获取遮光器层遮罩（遮光器影响哪些层）
     */
    get layerMask(): number {
        return this._layerMask;
    }

    /**
     * @en Set layer mask
     * @param value Layer mask value
     * @zh 设置遮光器层遮罩（遮光器影响哪些层）
     * @param value 层遮罩值
     */
    set layerMask(value: number) {
        if (this._layerMask !== value) {
            this._notifyOccluderLayerChange(this.layerMask, value);
            this._layerMask = value;

            this._layers.length = 0;
            for (let i = 0; i < Light2DManager.MAX_LAYER; i++)
                if (value & (1 << i))
                    this._layers.push(i);
        }
    }

    /**
     * @en Get light layers
     * @zh 获取灯光层数组（灯光影响哪些层）
     */
    get layers() {
        return this._layers;
    }

    private _canInLight: boolean = true; //如果灯光原点落入遮光器内部，是否挡光

    /**
     * @en Get can in light boolean value
     * @zh 获取灯光在内部时是否挡光
     */
    get canInLight(): boolean {
        return this._canInLight;
    }

    /**
     * @en Set can in light boolean value
     * @param value Boolean value
     * @zh 设置灯光在内部时是否挡光
     * @param value 布尔值
     */
    set canInLight(value: boolean) {
        this._canInLight = value;
    }

    private _outside: boolean = true; //是否只是外圈起作用

    /**
     * @en Get is only outside shadow the light
     * @zh 获取是否只是外圈遮挡光线
     */
    get outside(): boolean {
        return this._outside;
    }

    /**
     * @en Set is only outside shadow the light
     * @param value Boolean value
     * @zh 设置是否只是外圈遮挡光线
     * @param 布尔值
     */
    set outside(value: boolean) {
        this._outside = value;
    }

    /**
     * @internal
     * 遮光器Id
     */
    _occluderId: number = 0;

    /**
     * 遮光器范围（局部坐标）
     */
    private _localRange: Rectangle = new Rectangle();

    /**
     * 遮光器范围（世界坐标）
     */
    private _worldRange: Rectangle = new Rectangle();

    private _localCircle: Vector3 = new Vector3(0, 0, 1); //遮光器包围圆（x，y圆心，z半径，局部坐标）
    private _worldCircle: Vector3 = new Vector3(0, 0, 1); //遮光器包围圆（x，y圆心，z半径，世界坐标）

    /**
     * @internal
     * 需要更新遮光器
     */
    _needUpdate: boolean = false;

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
        (this.owner as Sprite).on("2DtransChanged", this, this._transformChange);
        (this.owner as Sprite).transChangeNotify = true;
        ((this.owner.scene as Scene)?._light2DManager as Light2DManager)?.addOccluder(this);
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        super._onDisable();
        (this.owner as Sprite).off("2DtransChanged", this, this._transformChange);
        ((this.owner.scene as Scene)?._light2DManager as Light2DManager)?.removeOccluder(this);
    }

    /**
     * @internal
     * 通知此遮光器层的改变
     * @param oldLayer 旧层遮罩
     * @param newLayer 新层遮罩
     */
    private _notifyOccluderLayerChange(oldLayer: number, newLayer: number) {
        ((this.owner?.scene as Scene)?._light2DManager as Light2DManager)?.occluderLayerMarkChange(this, oldLayer, newLayer);
    }

    /**
     * @internal
     * 响应矩阵改变
     */
    protected _transformChange() {
        this._transformPoly();
        this._needUpdate = true;
        this._needUpdateLightWorldRange = true;
    }

    /**
     * @en Set polygon endpoint data
     * @param poly Polygon data
     * @zh 设置多边形端点数据
     * @param poly 多边形数据
     */
    set polygonPoint(poly: PolygonPoint2D) {
        if (poly) {
            this._occluderPolygon = poly;
            this._globalPolygon = poly.clone();
            if (!this._cutPolygon)
                this._cutPolygon = new PolygonPoint2D();
            else this._cutPolygon.clear();
            this._needUpdate = true;
            this._needUpdateLightLocalRange = true;
            this._needUpdateLightWorldRange = true;
            ((this.owner?.scene as Scene)?._light2DManager as Light2DManager)?.addOccluder(this);
        } else {
            this._occluderPolygon = null;
            this._globalPolygon = null;
            this._cutPolygon.clear();
            ((this.owner?.scene as Scene)?._light2DManager as Light2DManager)?.removeOccluder(this);
        }
        ((this.owner?.scene as Scene)?._light2DManager as Light2DManager)?.needCollectLightInLayer(this.layerMask);
    }

    /**
     * @en Get polygon endpoint data
     * @zh 获取多边形端点数据
     */
    get polygonPoint() {
        return this._occluderPolygon;
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
                        }
                        else {
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

        //计算局部坐标包围圆
        const w = this._localRange.width;
        const h = this._localRange.height;
        this._localCircle.z = Math.sqrt(w * w + h * h) / 2 | 0;
        this._localCircle.x = (this._localRange.x + w / 2) | 0;
        this._localCircle.y = (this._localRange.y + h / 2) | 0;
    }

    /**
     * @internal
     * 计算范围（世界坐标）
     */
    private _calcWorldRange() {
        this._transformPoly();
        this._needUpdateLightWorldRange = false;

        //计算世界坐标包围圆
        const m = (this.owner as Sprite).transform;
        const ox = (this.owner as Sprite).globalPosX * Browser.pixelRatio;
        const oy = (this.owner as Sprite).globalPosY * Browser.pixelRatio;
        const sx = Math.abs((this.owner as Sprite).globalScaleX);
        const sy = Math.abs((this.owner as Sprite).globalScaleY);
        if (m) {
            this._worldCircle.x = m.a * this._localCircle.x + m.c * this._localCircle.y + ox;
            this._worldCircle.y = m.b * this._localCircle.x + m.d * this._localCircle.y + oy;
        } else {
            this._worldCircle.x = this._localCircle.x * sx + ox;
            this._worldCircle.y = this._localCircle.y * sy + oy;
        }
        this._worldCircle.z = Math.sqrt(sx * sx + sy * sy) * this._localCircle.z;

        //计算世界坐标包围盒
        this._worldRange.x = (this._worldCircle.x - this._worldCircle.z) | 0;
        this._worldRange.y = (this._worldCircle.y - this._worldCircle.z) | 0;
        this._worldRange.width = this._worldCircle.z * 2 | 0;
        this._worldRange.height = this._worldCircle.z * 2 | 0;
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
                let intersections = 0;
                const poly = this._occluderPolygon.points;
                const len = poly.length / 2 | 0;
                const ox = this.owner ? (this.owner as Sprite).globalPosX * Browser.pixelRatio : 0;
                const oy = this.owner ? (this.owner as Sprite).globalPosY * Browser.pixelRatio : 0;

                for (let i = 0; i < len; i++) {
                    const currentX = poly[i * 2 + 0];
                    const currentY = poly[i * 2 + 1];
                    const nextX = poly[((i + 1) % len) * 2 + 0]; //处理闭合
                    const nextY = poly[((i + 1) % len) * 2 + 1]; //处理闭合
                    const cx = currentX + ox;
                    const cy = currentY + oy;
                    const nx = nextX + ox;
                    const ny = nextY + oy;

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
        const m = (this.owner as Sprite).transform;
        if (this._globalPolygon) {
            const globalPoly = this._globalPolygon.points;
            const polygon = this._occluderPolygon.points;
            const ox = (this.owner as Sprite).globalPosX * Browser.pixelRatio;
            const oy = (this.owner as Sprite).globalPosY * Browser.pixelRatio;
            const len = polygon.length / 2 | 0;
            if (m) {
                for (let i = 0; i < len; i++) {
                    const x = polygon[i * 2 + 0] * Browser.pixelRatio;
                    const y = polygon[i * 2 + 1] * Browser.pixelRatio;
                    globalPoly[i * 2 + 0] = m.a * x + m.c * y + ox;
                    globalPoly[i * 2 + 1] = m.b * x + m.d * y + oy;
                }
            } else {
                const sx = Math.abs((this.owner as Sprite).globalScaleX);
                const sy = Math.abs((this.owner as Sprite).globalScaleY);
                for (let i = 0; i < len; i++) {
                    const x = polygon[i * 2 + 0] * Browser.pixelRatio;
                    const y = polygon[i * 2 + 1] * Browser.pixelRatio;
                    globalPoly[i * 2 + 0] = x * sx + ox;
                    globalPoly[i * 2 + 1] = y * sy + oy;
                }
            }

            //使缓存失效
            this._segments.length = 0;
            this._segLight.x = Number.POSITIVE_INFINITY;
            this._segLight.y = Number.POSITIVE_INFINITY;
        }
    }

    /**
     * @internal
     * 选择外边缘顶点
     * @param polygon 
     * @param outsidePointX 
     * @param outsidePointY 
     * @param outPoly 
     */
    private _selectOutside(polygon: number[], outsidePointX: number, outsidePointY: number, outPoly: number[]) {
        let abX = 0, abY = 0, cdX = 0, cdY = 0, acX = 0, acY = 0, det = 0, t = 0, u = 0;
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

            if (!interP1 && !interP2)
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