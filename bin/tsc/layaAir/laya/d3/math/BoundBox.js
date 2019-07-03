import { Vector3 } from "./Vector3";
/**
 * <code>BoundBox</code> 类用于创建包围盒。
 */
export class BoundBox {
    /**
     * 创建一个 <code>BoundBox</code> 实例。
     * @param	min 包围盒的最小顶点。
     * @param	max 包围盒的最大顶点。
     */
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    /**
     * @internal
     */
    _rotateExtents(extents, rotation, out) {
        var extentsX = extents.x;
        var extentsY = extents.y;
        var extentsZ = extents.z;
        var matElements = rotation.elements;
        out.x = Math.abs(matElements[0] * extentsX) + Math.abs(matElements[4] * extentsY) + Math.abs(matElements[8] * extentsZ);
        out.y = Math.abs(matElements[1] * extentsX) + Math.abs(matElements[5] * extentsY) + Math.abs(matElements[9] * extentsZ);
        out.z = Math.abs(matElements[2] * extentsX) + Math.abs(matElements[6] * extentsY) + Math.abs(matElements[10] * extentsZ);
    }
    /**
     * 获取包围盒的8个角顶点。
     * @param	corners 返回顶点的输出队列。
     */
    getCorners(corners) {
        corners.length = 8;
        var minX = this.min.x;
        var minY = this.min.y;
        var minZ = this.min.z;
        var maxX = this.max.x;
        var maxY = this.max.y;
        var maxZ = this.max.z;
        corners[0] = new Vector3(minX, maxY, maxZ);
        corners[1] = new Vector3(maxX, maxY, maxZ);
        corners[2] = new Vector3(maxX, minY, maxZ);
        corners[3] = new Vector3(minX, minY, maxZ);
        corners[4] = new Vector3(minX, maxY, minZ);
        corners[5] = new Vector3(maxX, maxY, minZ);
        corners[6] = new Vector3(maxX, minY, minZ);
        corners[7] = new Vector3(minX, minY, minZ);
    }
    /**
     * 获取中心点。
     * @param	out
     */
    getCenter(out) {
        Vector3.add(this.min, this.max, out);
        Vector3.scale(out, 0.5, out);
    }
    /**
     * 获取范围。
     * @param	out
     */
    getExtent(out) {
        Vector3.subtract(this.max, this.min, out);
        Vector3.scale(out, 0.5, out);
    }
    /**
     * 设置中心点和范围。
     * @param	center
     */
    setCenterAndExtent(center, extent) {
        Vector3.subtract(center, extent, this.min);
        Vector3.add(center, extent, this.max);
    }
    /**
     * @internal
     */
    tranform(matrix, out) {
        var center = BoundBox._tempVector30;
        var extent = BoundBox._tempVector31;
        this.getCenter(center);
        this.getExtent(extent);
        Vector3.transformCoordinate(center, matrix, center);
        this._rotateExtents(extent, matrix, extent);
        out.setCenterAndExtent(center, extent);
    }
    toDefault() {
        this.min.toDefault();
        this.max.toDefault();
    }
    /**
     * 从顶点生成包围盒。
     * @param	points 所需顶点队列。
     * @param	out 生成的包围盒。
     */
    static createfromPoints(points, out) {
        if (points == null)
            throw new Error("points");
        var min = out.min;
        var max = out.max;
        min.x = Number.MAX_VALUE;
        min.y = Number.MAX_VALUE;
        min.z = Number.MAX_VALUE;
        max.x = -Number.MAX_VALUE;
        max.y = -Number.MAX_VALUE;
        max.z = -Number.MAX_VALUE;
        for (var i = 0, n = points.length; i < n; ++i) {
            Vector3.min(min, points[i], min);
            Vector3.max(max, points[i], max);
        }
    }
    /**
     * 合并两个包围盒。
     * @param	box1 包围盒1。
     * @param	box2 包围盒2。
     * @param	out 生成的包围盒。
     */
    static merge(box1, box2, out) {
        Vector3.min(box1.min, box2.min, out.min);
        Vector3.max(box1.max, box2.max, out.max);
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var dest = destObject;
        this.min.cloneTo(dest.min);
        this.max.cloneTo(dest.max);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new BoundBox(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }
}
/**@internal */
BoundBox._tempVector30 = new Vector3();
/**@internal */
BoundBox._tempVector31 = new Vector3();
