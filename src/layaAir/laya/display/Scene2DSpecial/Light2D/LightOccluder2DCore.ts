import { Matrix } from "../../../maths/Matrix";
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
export class LightOccluder2DCore {
    /**
     * @internal
     */
    static _idCounter: number = 0; //遮光器计数器

    private _layerMask: number = 1; //遮光器层掩码
    private _layers: number[] = [0]; //遮光器层数组

    private _owner: Sprite; //所属精灵，可以没有
    set owner(value: Sprite) {
        this._owner = value;
    }
    private _manager: Light2DManager; //灯光管理器
    set manager(value: Light2DManager) {
        this._manager = value;
    }

    private _x: number = 0; //位置X
    private _y: number = 0; //位置Y
    private _scaleX: number = 1; //放缩X
    private _scaleY: number = 2; //放缩Y
    private _skewX: number = 0; //斜切X
    private _skewY: number = 0; //斜切Y
    private _rotation: number = 0; //旋转
    private _transform: Matrix; //矩阵
    private _tfChanged: boolean; //矩阵是否发生变化

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
     * @zh 是否只是外圈遮挡光线
     */
    get outside(): boolean {
        return this._outside;
    }
    set outside(value: boolean) {
        if (value !== this._outside) {
            this._outside = value;
            this._needUpdate = true;
            this._clearCache();
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
    private _needUpdate: boolean = false; //需要更新遮光器
    get needUpdate(): boolean {
        return this._needUpdate;
    }
    set needUpdate(value: boolean) {
        this._needUpdate = value;
    }

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
    constructor(manager?: Light2DManager) {
        this._manager = manager;
        this._occluderId = LightOccluder2DCore._idCounter++;
    }

    /**
     * @internal
     */
    _onEnable() {
        this._manager?.addOccluder(this);
    }

    /**
     * @internal
     */
    _onDisable() {
        this._manager?.removeOccluder(this);
    }

    /**
     * @en Set the position. Equivalent to setting the x and y properties separately.
     * Since the return value is the object itself, you can use the following syntax: spr.pos(...).scale(...);
     * @param x X-axis coordinate.
     * @param y Y-axis coordinate.
     * @returns The object itself.
     * @zh 设置坐标位置。相当于分别设置x和y属性。
     * 因为返回值为对象本身，所以可以使用如下语法：spr.pos(...).scale(...);
     * @param x X轴坐标。
     * @param y Y轴坐标。
     * @returns 返回对象本身。
     */
    pos(x: number, y: number): this {
        if (this._x != x || this._y != y) {
            this._x = x;
            this._y = y;
            this._tfChanged = true;
            this._transformChange();
        }
        return this;
    }

    /**
     * @en Set the scale. Equivalent to setting the scaleX and scaleY properties separately.
     * Since the return value is the object itself, you can use the following syntax: spr.scale(...).pos(50, 100);
     * @param x X-axis scale ratio.
     * @param y Y-axis scale ratio.
     * @returns The object itself.
     * @zh 设置缩放。相当于分别设置scaleX和scaleY属性。
     * @param x X轴缩放比例。
     * @param y Y轴缩放比例。
     * @returns 返回对象本身。
     */
    scale(x: number, y: number): this {
        if (this._scaleX !== x || this._scaleY !== y) {
            this._scaleX = x;
            this._scaleY = y;
            this._tfChanged = true;
            this._transformChange();
        }
        return this;
    }

    /**
     * @en Set the skew angle. Equivalent to setting the skewX and skewY properties separately.
     * Since the return value is the object itself, you can use the following syntax: spr.skew(...).pos(50, 100);
     * @param x Horizontal skew angle.
     * @param y Vertical skew angle.
     * @returns The object itself.
     * @zh 设置倾斜角度。相当于分别设置skewX和skewY属性。
     * 因为返回值为对象本身，所以可以使用如下语法：spr.skew(...).pos(50, 100);
     * @param x 水平倾斜角度。
     * @param y 垂直倾斜角度。
     * @returns 返回对象本身。
     */
    skew(x: number, y: number): this {
        if (this._skewX !== x || this._skewY !== y) {
            this._skewX = x;
            this._skewY = y;
            this._tfChanged = true;
            this._transformChange();
        }
        return this;
    }

    /**
     * @en The x coordinate value relative to the parent container.
     * @zh 显示对象相对于父容器的水平方向坐标值。
     */
    get x(): number {
        return this._x;
    }
    set x(value: number) {
        this.pos(value, this._y);
    }

    /**
     * @en The y coordinate value relative to the parent container.
     * @zh 显示对象相对于父容器的垂直方向坐标值。
     */
    get y(): number {
        return this._y;
    }
    set y(value: number) {
        this.pos(this._x, value);
    }

    /**
     * @en The scale factor on the X axis, with a default value of 1. Setting a negative value can achieve a horizontal flip effect, e.g., scaleX=-1.
     * @zh X轴缩放值，默认值为1。
    */
    get scaleX(): number {
        return this._scaleX;
    }
    set scaleX(value: number) {
        this.scale(value, this._scaleY);
    }

    /**
     * @en The scale factor on the Y axis, with a default value of 1. Setting a negative value can achieve a vertical flip effect, e.g., scaleY=-1.
     * @zh Y轴缩放值，默认值为1。
     */
    get scaleY(): number {
        return this._scaleY;
    }
    set scaleY(value: number) {
        this.scale(this._scaleX, value);
    }

    /**
     * @en The horizontal skew angle, in degrees, with a default value of 0.
     * @zh 水平倾斜角度，默认值为0。以角度为单位。
     */
    get skewX(): number {
        return this._skewX;
    }
    set skewX(value: number) {
        this.skew(value, this._skewX);
    }

    /**
      * @en The vertical skew angle, in degrees, with a default value of 0.
      * @zh 垂直倾斜角度,默认值为0。以角度为单位。
      */
    get skewY(): number {
        return this._skewY;
    }
    set skewY(value: number) {
        this.skew(this._skewX, value);
    }

    /**
     * @en The rotation angle, in degrees, with a default value of 0.
     * @zh 旋转角度，默认值为0。以角度为单位。
     */
    get rotation(): number {
        return this._rotation;
    }
    set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this._tfChanged = true;
            this._transformChange();
        }
    }

    get transform(): Matrix {
        if (!this._tfChanged)
            return this._transform;

        this._tfChanged = false;
        const m = this._transform || (this._transform = new Matrix());
        const sx = this._scaleX;
        const sy = this._scaleY;
        const sskx = this._skewX;
        const ssky = this._skewY;
        const rot = this._rotation;

        if (rot || sx !== 1 || sy !== 1 || sskx !== 0 || ssky !== 0) {
            m._bTransform = true;
            const skx = (rot - sskx) * 0.0174532922222222; //laya.CONST.PI180;
            const sky = (rot + ssky) * 0.0174532922222222;
            const cx = Math.cos(sky);
            const ssx = Math.sin(sky);
            const cy = Math.sin(skx);
            const ssy = Math.cos(skx);
            m.a = sx * cx;
            m.b = sx * ssx;
            m.c = -sy * cy;
            m.d = sy * ssy;
            m.tx = m.ty = 0;
        } else m.identity();
        return m;
    }

    set transform(value: Matrix) {
        this._tfChanged = false;
        const m = this._transform || (this._transform = new Matrix());
        if (value !== m)
            value.copyTo(m);
        if (value) { //设置transform时重置x,y
            this._x = m.tx;
            this._y = m.ty;
            m.tx = m.ty = 0;
        }
    }

    /**
     * @internal
     * 通知此遮光器层的改变
     * @param oldLayerMask 旧层掩码
     * @param newLayerMask 新层掩码
     */
    _layerMaskChange(oldLayerMask: number, newLayerMask: number) {
        this._manager?.occluderLayerMaskChange(this, oldLayerMask, newLayerMask);
    }

    /**
     * @internal
     * 响应矩阵改变
     */
    _transformChange() {
        this._needUpdate = true;
        this._needTransformPoly = true;
        this._needUpdateLightWorldRange = true;
        this._manager?.needCollectOccluderInLight(this.layerMask);
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
            this._needTransformPoly = true;
            this._needUpdateLightLocalRange = true;
            this._needUpdateLightWorldRange = true;
            this._manager?.addOccluder(this);
        } else {
            this._occluderPolygon = null;
            this._globalPolygon = null;
            if (this._cutPolygon)
                this._cutPolygon.clear();
            this._manager?.removeOccluder(this);
        }
        this._manager?.needCollectOccluderInLight(this.layerMask);
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
        return this._getRange().intersects(range);
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
     * 变换多边形顶点
     */
    private _transformPoly() {
        if (this._globalPolygon) {
            const globalPoly = this._globalPolygon.points;
            const polygon = this._occluderPolygon.points;
            const len = polygon.length / 2 | 0;
            const ox = this._owner ? this._owner.globalPosX : this._x;
            const oy = this._owner ? this._owner.globalPosY : this._y;
            const m = this._owner ? this._owner.getGlobalMatrix() : this._transform;
            if (m) {
                for (let i = 0; i < len; i++) {
                    const x = polygon[i * 2 + 0];
                    const y = polygon[i * 2 + 1];
                    globalPoly[i * 2 + 0] = m.a * x + m.c * y + ox;
                    globalPoly[i * 2 + 1] = m.b * x + m.d * y + oy;
                }
            } else {
                const sx = Math.abs(this._owner ? this._owner.globalScaleX : this._scaleX);
                const sy = Math.abs(this._owner ? this._owner.globalScaleY : this._scaleY);
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

    /**
     * 销毁
     */
    destroy() {
        this._onDisable();
        this.owner = null;
        this.manager = null;
    }
}