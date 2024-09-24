import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { IClone } from "../../utils/IClone";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";
import { BoundBox } from "./BoundBox";

/**
 * @en used for creating a bounding volume.
 * @zh 用于创建包围体。
 */
export class Bounds implements IClone {
    /**
     * @en Merges two bounding boxes into one.
     * @param box1 The first bounding box.
     * @param box2 The second bounding box.
     * @param out The merged bounding box.
     * @zh 合并两个包围盒。
     * @param box1 第一个包围盒。
     * @param box2 第二个包围盒。
     * @param out 生成的包围盒。
     */
    static merge(box1: Bounds, box2: Bounds, out: Bounds): void {
        Vector3.min(box1.min, box2.min, out.min);
        Vector3.max(box1.max, box2.max, out.max);
        out.min = out.min;
        out.max = out.max;
    }

    /**
     * @en Determines whether the bounding box contains a point.
     * @param box The bounding box.
     * @param point The point to check.
     * @returns `true` if the point is inside the bounding box; otherwise, `false`.
     * @zh 判断包围盒是否包含一个点。
     * @param box 包围盒。
     * @param point 需要检测的点。
     * @return 如果点在包围盒内返回 `true`；否则返回 `false`。
     */
    static containPoint(box: Bounds, point: Vector3): boolean {
        let max = box._imp.getMax();
        let min = box._imp.getMin();
        if (point.x > max.x || point.x < min.x) return false;
        if (point.y > max.y || point.y < min.y) return false;
        if (point.z > max.z || point.z < min.z) return false;
        return true;
    }


    /**@internal */
    static _UPDATE_MIN: number = 0x01;
    /**@internal */
    static _UPDATE_MAX: number = 0x02;
    /**@internal */
    static _UPDATE_CENTER: number = 0x04;
    /**@internal */
    static _UPDATE_EXTENT: number = 0x08;

    /**@internal	*/
    _imp: any;

    /**
     * @en The minimum point of the bounding box.
     * @zh 包围盒的最小点
     */
    get min() {
        return this.getMin();
    }

    set min(value: Vector3) {
        this.setMin(value);
    }

    /**
     * @en The maximum point of the bounding box.
     * @zh 包围盒的最大点
     */
    get max() {
        return this.getMax();
    }

    set max(value: Vector3) {
        this.setMax(value);
    }

    /**
     * @en The center point of the bounding box.
     * @param value The new center point of the bounding box.
     * @zh 设置包围盒的最小点。
     * @param value	包围盒的新最小点。
     */
    setMin(value: Vector3): void {
        this._imp.setMin(value);
    }

    /**
     * @en Gets the minimum point of the bounding box.
     * @return The minimum point of the bounding box.
     * @zh 获取包围盒的最小点。
     * @return	包围盒的最小点。
     */
    getMin(): Vector3 {
        return this._imp.getMin();
    }

    /**
     * @en Sets the maximum point of the bounding box.
     * @param value The new maximum point of the bounding box.
     * @zh 设置包围盒的最大点。
     * @param value	包围盒的新最大点。
     */
    setMax(value: Vector3): void {
        this._imp.setMax(value);
    }

    /**
     * @en Gets the maximum point of the bounding box.
     * @return The maximum point of the bounding box.
     * @zh 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax(): Vector3 {
        return this._imp.getMax();
    }

    /**
     * @en Sets the center point of the bounding box.
     * @param value The new center point of the bounding box.
     * @zh 设置包围盒的中心点。
     * @param value	包围盒的新中心点。
     */
    setCenter(value: Vector3): void {
        this._imp.setCenter(value);
    }

    /**
     * @en Gets the center point of the bounding box.
     * @return The center point of the bounding box.
     * @zh 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter(): Vector3 {
        return this._imp.getCenter();
    }

    /**
     * @en Sets the range of the bounding box.
     * @param value The new range of the bounding box.
     * @zh 设置包围盒的范围。
     * @param value	包围盒的新范围。
     */
    setExtent(value: Vector3): void {
        this._imp.setExtent(value);
    }

    /**
     * @en Gets the range of the bounding box.
     * @return The range of the bounding box.
     * @zh 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent(): Vector3 {
        return this._imp.getExtent();
    }

    /**
     * @en Constructor method.
     * @param	min  The minimum point of the bounding box.
     * @param	max  The maximum point of the bounding box.
     * @zh 构造方法。
     * @param	min  min 最小坐标
     * @param	max  max 最大坐标。
     */
    constructor(min?: Vector3, max?: Vector3) {
        this._imp = Laya3DRender.Render3DModuleDataFactory.createBounds(min, max);
    }

    /**
     * 获得更新标志
     * @internal
     * @param type 类型 
     * @return void
     */
    protected _getUpdateFlag(type: number): boolean {
        return this._imp._getUpdateFlag(type);
    }

    /**
     * 设置更新标志
     * @internal
     * @param type 类型 
     * @param value 值 
     * @return void
     */
    protected _setUpdateFlag(type: number, value: boolean): void {
        this._imp._setUpdateFlag(type, value);
    }

    /**
     * 获得包围盒中心值
     * @internal
     * @param min 最小值
     * @param max 最大值
     * @param out 返回值
     * @return void
     */
    protected _getCenter(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.add(min, max, out);
        Vector3.scale(out, 0.5, out);
    }

    /**
     * 获得包围盒范围
     * @internal
     * @param min 最小值
     * @param max 最大值
     * @param out 返回值
     * @return void
     */
    protected _getExtent(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.subtract(max, min, out);
        Vector3.scale(out, 0.5, out);
    }

    /**
     * 获得包围盒最小值
     * @internal
     * @param center 中心点
     * @param extent 范围
     * @param out 返回值
     * @return void
     */
    protected _getMin(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.subtract(center, extent, out);
    }

    /**
     * 获得包围盒最大值
     * @internal
     * @param center 中心点
     * @param extent 范围
     * @param out 返回值
     * @return void
     */
    protected _getMax(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.add(center, extent, out);
    }

    /**
    * 旋转范围
    * @internal
    * @param extent 范围
    * @param rotation 旋转矩阵
    * @param out 返回值
    * @return void
    */
    protected _rotateExtents(extents: Vector3, rotation: Matrix4x4, out: Vector3): void {
        var extentsX: number = extents.x;
        var extentsY: number = extents.y;
        var extentsZ: number = extents.z;
        var matE: Float32Array = rotation.elements;
        out.x = Math.abs(matE[0] * extentsX) + Math.abs(matE[4] * extentsY) + Math.abs(matE[8] * extentsZ);
        out.y = Math.abs(matE[1] * extentsX) + Math.abs(matE[5] * extentsY) + Math.abs(matE[9] * extentsZ);
        out.z = Math.abs(matE[2] * extentsX) + Math.abs(matE[6] * extentsY) + Math.abs(matE[10] * extentsZ);
    }

    /**
     * 转换包围盒
     * @internal
     * @param matrix 转换矩阵
     * @param out 输出包围盒
     */
    _tranform(matrix: Matrix4x4, out: Bounds): void {
        this._imp._tranform(matrix, out._imp);
    }

    /**
     * @en Retrieves the eight corner vertices of the bounding box.
     * @param corners The array to store the corner vertices. 
     * @zh 获取包围盒的八个角顶点
     * @param corners 存储角顶点的数组。
     */
    getCorners(corners: Vector3[]) {
        this._imp.getCorners(corners);
    }

    /**
     * @en Gets the bounding box.
     * @param box The bounding box to store the result.
     * @zh 获取包围盒
     * @param box 用于存储结果的包围盒。
     */
    getBoundBox(box: BoundBox): void {
        this._imp._getBoundBox().cloneTo(box);
    }

    /**
     * @en Calculate whether two bounding boxes intersect
     * @param bounds The bounding box to calculate the intersection volume.
     * @return -1 if the two bounding boxes do not intersect; when not 0, the return value is the intersecting volume
     * @zh 计算两个包围盒是否相交
     * @param bounds 需要计算包围盒
     * @returns -1为不相交 不为0的时候返回值为相交体积
     */
    calculateBoundsintersection(bounds: Bounds): number {
        return this._imp.calculateBoundsintersection(bounds._imp);
    }


    /**
     * @en Clones this bounds into another object.
     * @param destObject The destination object to clone into.
     * @zh 克隆这个边界到另一个对象。
     * @param destObject 克隆目标对象。
     */
    cloneTo(destObject: any): void {
        this._imp.cloneTo(destObject._imp);
    }

    /**
     * @en Creates a clone of this bounds.
     * @return A new `Bounds` instance that is a clone of this one.
     * @zh 创建这个边界的克隆。
     * @return 一个新的 `Bounds` 实例，是当前边界的克隆。
     */
    clone(): any {
        var dest: Bounds = new Bounds(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }

}
