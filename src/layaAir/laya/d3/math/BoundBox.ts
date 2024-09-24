import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { IClone } from "../../utils/IClone"

/**
 * @en The `BoundBox` class is used for creating a bounding box.
 * @zh `BoundBox` 类用于创建包围盒。
 */
export class BoundBox implements IClone {
	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector31: Vector3 = new Vector3();

	/**
	 * @en The minimum vertex of the bounding box.
	 * @zh 包围盒的最小顶点。
	 */
	min: Vector3;
	/**
	 * @en The maximum vertex of the bounding box.
	 * @zh 包围盒的最大顶点。
	 */
	max: Vector3;

	/**
	 * @en Constructor method of the bounding box.
	 * @param	min The minimum vertex of the bounding box.
	 * @param	max The maximum vertex of the bounding box.
	 * @zh 包围盒的构造方法。
	 * @param	min 包围盒的最小顶点。
	 * @param	max 包围盒的最大顶点。
	 */
	constructor(min: Vector3, max: Vector3) {
		this.min = min;
		this.max = max;
	}

	/**
	 * @internal
	 */
	private _rotateExtents(extents: Vector3, rotation: Matrix4x4, out: Vector3): void {
		var extentsX: number = extents.x;
		var extentsY: number = extents.y;
		var extentsZ: number = extents.z;
		var matElements: Float32Array = rotation.elements;
		out.x = Math.abs(matElements[0] * extentsX) + Math.abs(matElements[4] * extentsY) + Math.abs(matElements[8] * extentsZ);
		out.y = Math.abs(matElements[1] * extentsX) + Math.abs(matElements[5] * extentsY) + Math.abs(matElements[9] * extentsZ);
		out.z = Math.abs(matElements[2] * extentsX) + Math.abs(matElements[6] * extentsY) + Math.abs(matElements[10] * extentsZ);
	}

	/**
	 * @en Retrieves the 8 corner vertices of the bounding box.
	 * @param corners The array to store the corner vertices.
	 * @zh 获取包围盒的8个角顶点。
	 * @param corners 角顶点的输出数组。
	 */
	getCorners(corners: Vector3[]): void {
		corners.length = 8;
		var minX: number = this.min.x;
		var minY: number = this.min.y;
		var minZ: number = this.min.z;
		var maxX: number = this.max.x;
		var maxY: number = this.max.y;
		var maxZ: number = this.max.z;
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
	 * @en Retrieves the center point of the bounding box.。
	 * @param out The vector to store the center point.
	 * @zh 获取包围盒的中心点。
	 * @param out 存储中心点的向量。
	 */
	getCenter(out: Vector3): void {
		Vector3.add(this.min, this.max, out);
		Vector3.scale(out, 0.5, out);
	}

	/**
	 * @en Retrieves the extents of the bounding box.
	 * @param out The vector to store the extents.
	 * @zh 获取包围盒的范围。
	 * @param out 存储轴半径的向量。
	 */
	getExtent(out: Vector3): void {
		Vector3.subtract(this.max, this.min, out);
		Vector3.scale(out, 0.5, out);
	}

	/**
	 * @en Sets the center and extents of the bounding box.
	 * @param center The center point of the bounding box.
	 * @param extent The axis radius of the bounding box.
	 * @zh 设置包围盒的中心点和范围
	 * @param center 包围盒的中心点。
	 * @param extent 包围盒的轴半径
	 */
	setCenterAndExtent(center: Vector3, extent: Vector3): void {
		Vector3.subtract(center, extent, this.min);
		Vector3.add(center, extent, this.max);
	}

	/**
	 * @internal
	 * @en Transforms the bounding box using the given matrix.
	 * @param matrix The transformation matrix.
	 * @param out The bounding box to store the result.
	 * @zh 使用给定的矩阵变换包围盒。
	 * @param matrix 变换矩阵。
	 * @param out 存储结果的包围盒。
	 */
	tranform(matrix: Matrix4x4, out: BoundBox): void {
		var center: Vector3 = BoundBox._tempVector30;
		var extent: Vector3 = BoundBox._tempVector31;
		this.getCenter(center);
		this.getExtent(extent);
		Vector3.transformCoordinate(center, matrix, center);
		this._rotateExtents(extent, matrix, extent);
		out.setCenterAndExtent(center, extent);
	}

	/**
	 * @en Resets the bounding box to its default values.
	 * @zh 将包围盒重置为其默认值。
	 */
	toDefault(): void {
		this.min.toDefault();
		this.max.toDefault();
	}

	/**
	 * @en Creates a bounding box from a set of points.
	 * @param points The set of points.
	 * @param out The resulting bounding box.
	 * @zh 从一组顶点生成包围盒。
	 * @param points 所需顶点队列。
	 * @param out 生成的包围盒。
	 */
	static createfromPoints(points: Vector3[], out: BoundBox): void {
		if (points == null)
			throw new Error("points");

		var min: Vector3 = out.min;
		var max: Vector3 = out.max;
		min.x = Number.MAX_VALUE;
		min.y = Number.MAX_VALUE;
		min.z = Number.MAX_VALUE;
		max.x = -Number.MAX_VALUE;
		max.y = -Number.MAX_VALUE;
		max.z = -Number.MAX_VALUE;

		for (var i: number = 0, n: number = points.length; i < n; ++i) {
			Vector3.min(min, points[i], min);
			Vector3.max(max, points[i], max);
		}
	}

	/**
	 * @en Merges two bounding boxes into one.
	 * @param box1 The first bounding box.
	 * @param box2 The second bounding box.
	 * @param out The merged bounding box
	 * @zh 合并两个包围盒为一个。
	 * @param box1 第一个包围盒。
	 * @param box2 第二个包围盒。
	 * @param out 合并后的包围盒。
	 */
	static merge(box1: BoundBox, box2: BoundBox, out: BoundBox): void {
		Vector3.min(box1.min, box2.min, out.min);
		Vector3.max(box1.max, box2.max, out.max);
	}

	/**
	 * @en Clones this bounding box to another object.
	 * @param destObject The object to receive the clone.
	 * @zh 克隆这个包围盒到另一个对象。
	 * @param destObject 接收克隆的对象。
	 */
	cloneTo(destObject: BoundBox): void {
		var dest: BoundBox = (<BoundBox>destObject);
		this.min.cloneTo(dest.min);
		this.max.cloneTo(dest.max);
	}

	/**
	 * @en Creates a clone of this bounding box.
	 * @return The cloned bounding box.
	 * @zh 创建这个包围盒的克隆。
	 * @return 克隆的包围盒。
	 */
	clone(): any {
		var dest: BoundBox = new BoundBox(new Vector3(), new Vector3());
		this.cloneTo(dest);
		return dest;
	}

}



