import { Plane } from "./Plane";
import { CollisionUtils } from "./CollisionUtils";
import { ContainmentType } from "./ContainmentType";
import { BoundBox } from "./BoundBox";
import { BoundSphere } from "./BoundSphere";
import { IClone } from "../../utils/IClone";
import { Bounds } from "./Bounds";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";

/**
 * @en The corner of frustum.
 * @zh 锥体角点。
 */
export enum FrustumCorner {
	FarBottomLeft = 0,
	FarTopLeft = 1,
	FarTopRight = 2,
	FarBottomRight = 3,
	nearBottomLeft = 4,
	nearTopLeft = 5,
	nearTopRight = 6,
	nearBottomRight = 7,
	unknown = 8
}


/**
 * @en The BoundFrustum class is used to create a frustum.
 * @zh BoundFrustum 类用于创建截锥体。
 */
export class BoundFrustum implements IClone {
	/**
	 * @en Obtain 6 enclosing planes based on the matrix.
	 * @param  m The matrix that describes the frustum.
	 * @param  np The near plane.
	 * @param  fp The far plane.
	 * @param  lp The left plane.
	 * @param  rp The right plane.
	 * @param  tp The top plane.
	 * @param  bp The bottom plane.
	 * @zh 根据矩阵获取6个包围平面。
	 * @param  m 描述矩阵。
	 * @param  np 近平面。
	 * @param  fp 远平面。
	 * @param  lp 左平面。
	 * @param  rp 右平面。
	 * @param  tp 顶平面。
	 * @param  bp 底平面。
	 */
	static getPlanesFromMatrix(m: Matrix4x4, np: Plane, fp: Plane, lp: Plane, rp: Plane, tp: Plane, bp: Plane): void {
		var matrixE: Float32Array = m.elements;
		var m11: number = matrixE[0];
		var m12: number = matrixE[1];
		var m13: number = matrixE[2];
		var m14: number = matrixE[3];
		var m21: number = matrixE[4];
		var m22: number = matrixE[5];
		var m23: number = matrixE[6];
		var m24: number = matrixE[7];
		var m31: number = matrixE[8];
		var m32: number = matrixE[9];
		var m33: number = matrixE[10];
		var m34: number = matrixE[11];
		var m41: number = matrixE[12];
		var m42: number = matrixE[13];
		var m43: number = matrixE[14];
		var m44: number = matrixE[15];

		//near
		var nearNorE: Vector3 = np.normal;
		nearNorE.x = m13;
		nearNorE.y = m23;
		nearNorE.z = m33;
		np.distance = m43;
		np.normal = nearNorE;
		np.normalize();

		//far
		var farNorE: Vector3 = fp.normal;
		farNorE.x = m14 - m13;
		farNorE.y = m24 - m23;
		farNorE.z = m34 - m33;
		fp.distance = m44 - m43;
		fp.normal = farNorE;
		fp.normalize();

		//left
		var leftNorE: Vector3 = lp.normal;
		leftNorE.x = m14 + m11;
		leftNorE.y = m24 + m21;
		leftNorE.z = m34 + m31;
		lp.distance = m44 + m41;
		lp.normal = leftNorE;
		lp.normalize();

		//right
		var rightNorE: Vector3 = rp.normal;
		rightNorE.x = m14 - m11;
		rightNorE.y = m24 - m21;
		rightNorE.z = m34 - m31;
		rp.distance = m44 - m41;
		rp.normal = rightNorE;
		rp.normalize();

		//top
		var topNorE: Vector3 = tp.normal;
		topNorE.x = m14 - m12;
		topNorE.y = m24 - m22;
		topNorE.z = m34 - m32;
		tp.distance = m44 - m42;
		tp.normal = topNorE;
		tp.normalize();

		//bottom
		var bottomNorE: Vector3 = bp.normal;
		bottomNorE.x = m14 + m12;
		bottomNorE.y = m24 + m22;
		bottomNorE.z = m34 + m32;
		bp.distance = m44 + m42;
		bp.normal = bottomNorE;
		bp.normalize();
	}

	/** @internal */
	protected _matrix: Matrix4x4;
	/** @internal */
	protected _near: Plane;
	/** @internal */
	protected _far: Plane;
	/** @internal */
	protected _left: Plane;
	/** @internal */
	protected _right: Plane;
	/** @internal */
	protected _top: Plane;
	/** @internal */
	protected _bottom: Plane;

	/**
	 * @en Constructor method.
	 * @param matrix The 4x4 matrix that describes the frustum.
	 * @zh 构造方法。
	 * @param matrix 锥截体的描述4x4矩阵。
	 */
	constructor(matrix: Matrix4x4) {
		this._matrix = matrix;
		this.initBoundingPlane();
	}

	protected initBoundingPlane() {
		this._near = new Plane();
		this._far = new Plane();
		this._left = new Plane();
		this._right = new Plane();
		this._top = new Plane();
		this._bottom = new Plane();
		BoundFrustum.getPlanesFromMatrix(this._matrix, this._near, this._far, this._left, this._right, this._top, this._bottom);
	}

	/**
	 * @en The matrix that describes the frustum.
	 * @zh 描述矩阵。
	 */
	get matrix(): Matrix4x4 {
		return this._matrix;
	}

	set matrix(matrix: Matrix4x4) {
		matrix.cloneTo(this._matrix)
		BoundFrustum.getPlanesFromMatrix(this._matrix, this._near, this._far, this._left, this._right, this._top, this._bottom);
	}

	/**
	 * @en The near plane.
	 * @zh 近平面。
	 */
	get near(): Plane {
		return this._near;
	}

	/**
	 * @en The far plane.
	 * @zh 远平面。
	 */
	get far(): Plane {
		return this._far;
	}

	/**
	 * @en The left plane.
	 * @zh 左平面。
	 */
	get left(): Plane {
		return this._left;
	}

	/**
	 * @en The right plane.
	 * @zh 右平面。
	 */
	get right(): Plane {
		return this._right;
	}

	/**
	 * @en The top plane.
	 * @zh 顶平面。
	 */
	get top(): Plane {
		return this._top;
	}

	/**
	 * @en The bottom plane.
	 * @zh 底平面。
	 */
	get bottom(): Plane {
		return this._bottom;
	}

	/**
	 * @en Determines whether this bound frustum is equal to another bound frustum.
	 * @param other The other bound frustum to compare.
	 * @zh 判断这个截锥体是否与另一个截锥体相等。
	 * @param other 要比较的另一个截锥体。
	 */
	equalsBoundFrustum(other: BoundFrustum): boolean {
		return this._matrix.equalsOtherMatrix(other.matrix)
	}

	/**
	 * @en Determines whether this object is equal to another object.
	 * @param obj The object to compare.
	 * @zh 判断此对象是否等于另一个对象。
	 * @param obj 要比较的另一个对象。
	 */
	equalsObj(obj: any): boolean {
		if (obj instanceof BoundFrustum) {
			var bf: BoundFrustum = (<BoundFrustum>obj);
			return this.equalsBoundFrustum(bf);
		}
		return false;
	}

	/**
	 * @en Gets a specific plane of the frustum.
	 * @param index The index of the plane to retrieve. Indices:
	 * - 0: Near plane
	 * - 1: Far plane
	 * - 2: Left plane
	 * - 3: Right plane
	 * - 4: Top plane
	 * - 5: Bottom plane
	 * @returns The requested plane or `null` if the index is out of range.
	 * @zh 获取截锥体的特定平面。
	 * @param index 要检索的平面的索引。索引：
	 * - 0: 近平面
	 * - 1: 远平面
	 * - 2: 左平面
	 * - 3: 右平面
	 * - 4: 顶平面
	 * - 5: 底平面
	 * @returns 所请求的平面或 `null` 如果索引超出范围。
	 */
	getPlane(index: number): Plane {
		switch (index) {
			case 0:
				return this._near;
			case 1:
				return this._far;
			case 2:
				return this._left;
			case 3:
				return this._right;
			case 4:
				return this._top;
			case 5:
				return this._bottom;
			default:
				return null;
		}
	}

	/**
	 * @en Calculates the intersection point of three planes within the frustum.
	 * @param p1 The first plane.
	 * @param p2 The second plane.
	 * @param p3 The third plane.
	 * @param out The vector to store the intersection point.
	 * @zh 计算截锥体中三个平面的交点。
	 * @param p1 第一个平面。
	 * @param p2 第二个平面。
	 * @param p3 第三个平面。
	 * @param out 存储交点的向量。
	 */
	static get3PlaneInterPoint(p1: Plane, p2: Plane, p3: Plane, out: Vector3): void {
		var p1Nor: Vector3 = p1.normal;
		var p2Nor: Vector3 = p2.normal;
		var p3Nor: Vector3 = p3.normal;

		Vector3.cross(p2Nor, p3Nor, _tempV30);
		Vector3.cross(p3Nor, p1Nor, _tempV31);
		Vector3.cross(p1Nor, p2Nor, _tempV32);

		var a: number = Vector3.dot(p1Nor, _tempV30);
		var b: number = Vector3.dot(p2Nor, _tempV31);
		var c: number = Vector3.dot(p3Nor, _tempV32);

		Vector3.scale(_tempV30, -p1.distance / a, _tempV33);
		Vector3.scale(_tempV31, -p2.distance / b, _tempV34);
		Vector3.scale(_tempV32, -p3.distance / c, _tempV35);

		Vector3.add(_tempV33, _tempV34, _tempV36);
		Vector3.add(_tempV35, _tempV36, out);
	}

	/**
	 * @en Retrieves the eight corner points of the frustum.
	 * @param corners The array to store the corner points.
	 * @zh 获取截锥体的八个角点
	 * @param corners 存储角点的数组。
	 */
	getCorners(corners: Vector3[]): void {
		BoundFrustum.get3PlaneInterPoint(this._near, this._bottom, this._right, corners[FrustumCorner.nearBottomRight]);
		BoundFrustum.get3PlaneInterPoint(this._near, this._top, this._right, corners[FrustumCorner.nearTopRight]);
		BoundFrustum.get3PlaneInterPoint(this._near, this._top, this._left, corners[FrustumCorner.nearTopLeft]);
		BoundFrustum.get3PlaneInterPoint(this._near, this._bottom, this._left, corners[FrustumCorner.nearBottomLeft]);
		BoundFrustum.get3PlaneInterPoint(this._far, this._bottom, this._right, corners[FrustumCorner.FarBottomRight]);
		BoundFrustum.get3PlaneInterPoint(this._far, this._top, this._right, corners[FrustumCorner.FarTopRight]);
		BoundFrustum.get3PlaneInterPoint(this._far, this._top, this._left, corners[FrustumCorner.FarTopLeft]);
		BoundFrustum.get3PlaneInterPoint(this._far, this._bottom, this._left, corners[FrustumCorner.FarBottomLeft]);
	}

	/**
	 * @en Determines the relationship between the frustum and a point.
	 * @param point The point to test.
	 * @returns The relationship between the point and the frustum:
	 * - 1: The point is inside the frustum.
	 * - 2: The point intersects the frustum.
	 * - 0: The point is outside and does not intersect the frustum.
	 * @zh 确定截锥体与点的关系。
	 * @param point  要测试的点。
	 * @returns 点与截锥体之间的关系：
	 * - 1: 点在截锥体内。
	 * - 2: 点与截锥体相交。
	 * - 0: 点在截锥体外且不相交。
	 */
	containsPoint(point: Vector3): number {
		var result: number = Plane.PlaneIntersectionType_Front;
		var planeResult: number = Plane.PlaneIntersectionType_Front;

		for (var i: number = 0; i < 6; i++) {

			switch (i) {
				case 0:
					planeResult = CollisionUtils.intersectsPlaneAndPoint(this._near, point);
					break;
				case 1:
					planeResult = CollisionUtils.intersectsPlaneAndPoint(this._far, point);
					break;
				case 2:
					planeResult = CollisionUtils.intersectsPlaneAndPoint(this._left, point);
					break;
				case 3:
					planeResult = CollisionUtils.intersectsPlaneAndPoint(this._right, point);
					break;
				case 4:
					planeResult = CollisionUtils.intersectsPlaneAndPoint(this._top, point);
					break;
				case 5:
					planeResult = CollisionUtils.intersectsPlaneAndPoint(this._bottom, point);
					break;
			}

			switch (planeResult) {
				case Plane.PlaneIntersectionType_Back:
					return ContainmentType.Disjoint;
				case Plane.PlaneIntersectionType_Intersecting:
					result = Plane.PlaneIntersectionType_Intersecting;
					break;
			}
		}

		switch (result) {
			case Plane.PlaneIntersectionType_Intersecting:
				return ContainmentType.Intersects;
			default:
				return ContainmentType.Contains;
		}
	}

	/**
	 * @en Determines whether this frustum intersects with a bounding box.
	 * @param box The bounding box to test against.
	 * @returns `true` if they intersect; otherwise, `false`.
	 * @zh 判断这个截锥体是否与包围盒相交。
	 * @param box 要测试的包围盒。
	 * @returns 如果相交返回 `true`；否则返回 `false`。
	 */
	intersects(box: BoundBox | Bounds): boolean {
		var min: Vector3 = box.min;
		var max: Vector3 = box.max;
		var minX: number = min.x;
		var minY: number = min.y;
		var minZ: number = min.z;
		var maxX: number = max.x;
		var maxY: number = max.y;
		var maxZ: number = max.z;

		var nearNormal: Vector3 = this._near.normal;
		if (this._near.distance + (nearNormal.x * (nearNormal.x < 0 ? minX : maxX)) + (nearNormal.y * (nearNormal.y < 0 ? minY : maxY)) + (nearNormal.z * (nearNormal.z < 0 ? minZ : maxZ)) < 0)
			return false;

		var leftNormal: Vector3 = this._left.normal;
		if (this._left.distance + (leftNormal.x * (leftNormal.x < 0 ? minX : maxX)) + (leftNormal.y * (leftNormal.y < 0 ? minY : maxY)) + (leftNormal.z * (leftNormal.z < 0 ? minZ : maxZ)) < 0)
			return false

		var rightNormal: Vector3 = this._right.normal;
		if (this._right.distance + (rightNormal.x * (rightNormal.x < 0 ? minX : maxX)) + (rightNormal.y * (rightNormal.y < 0 ? minY : maxY)) + (rightNormal.z * (rightNormal.z < 0 ? minZ : maxZ)) < 0)
			return false;

		var bottomNormal: Vector3 = this._bottom.normal;
		if (this._bottom.distance + (bottomNormal.x * (bottomNormal.x < 0 ? minX : maxX)) + (bottomNormal.y * (bottomNormal.y < 0 ? minY : maxY)) + (bottomNormal.z * (bottomNormal.z < 0 ? minZ : maxZ)) < 0)
			return false;

		var topNormal: Vector3 = this._top.normal;
		if (this._top.distance + (topNormal.x * (topNormal.x < 0 ? minX : maxX)) + (topNormal.y * (topNormal.y < 0 ? minY : maxY)) + (topNormal.z * (topNormal.z < 0 ? minZ : maxZ)) < 0)
			return false;

		// Can ignore far plane when distant object culling is handled by another mechanism
		var farNormal: Vector3 = this._far.normal;
		if (this._far.distance + (farNormal.x * (farNormal.x < 0 ? minX : maxX)) + (farNormal.y * (farNormal.y < 0 ? minY : maxY)) + (farNormal.z * (farNormal.z < 0 ? minZ : maxZ)) < 0)
			return false;

		return true;
	}

	/**
	 * @en Determines the spatial relationship between this frustum and a bounding box.
	 * @param box The bounding box to test.
	 * @returns The spatial relationship: 
	 * - 1: The bounding box is inside the frustum.
	 * - 2: The bounding box intersects the frustum.
	 * - 0: The bounding box is outside and does not intersect the frustum.
	 * @zh 确定这个截锥体和包围盒之间的空间关系。
	 * @param box 要测试的包围盒。
	 * @returns 关系类型：
	 * - 1: 包围盒在截锥体内。
	 * - 2: 包围盒与截锥体相交。
	 * - 0: 包围盒在截锥体外且不相交。
	 */
	containsBoundBox(box: BoundBox | Bounds): number {
		var p: Vector3 = _tempV30, n: Vector3 = _tempV31;
		var boxMin: Vector3 = box.min;
		var boxMax: Vector3 = box.max;
		var result: number = ContainmentType.Contains;
		for (var i: number = 0; i < 6; i++) {
			var plane: Plane = this.getPlane(i);
			var planeNor: Vector3 = plane.normal;

			if (planeNor.x >= 0) {
				p.x = boxMax.x;
				n.x = boxMin.x;
			} else {
				p.x = boxMin.x;
				n.x = boxMax.x;
			}
			if (planeNor.y >= 0) {
				p.y = boxMax.y;
				n.y = boxMin.y;
			} else {
				p.y = boxMin.y;
				n.y = boxMax.y;
			}
			if (planeNor.z >= 0) {
				p.z = boxMax.z;
				n.z = boxMin.z;
			} else {
				p.z = boxMin.z;
				n.z = boxMax.z;
			}

			if (CollisionUtils.intersectsPlaneAndPoint(plane, p) === Plane.PlaneIntersectionType_Back)
				return ContainmentType.Disjoint;

			if (CollisionUtils.intersectsPlaneAndPoint(plane, n) === Plane.PlaneIntersectionType_Back)
				result = ContainmentType.Intersects;
		}
		return result;
	}

	/**
	 * @en Determines the spatial relationship between this frustum and a bounding sphere.
	 * @param sphere The bounding sphere to test.
	 * @returns The relationship type: 
	 * - 1: The sphere is inside the frustum.
	 * - 2: The sphere intersects the frustum.
	 * - 0: The sphere is outside and does not intersect the frustum.
	 * @zh 确定这个截锥体和包围球之间的空间关系。
	 * @param sphere 要测试的包围球。
	 * @returns 关系类型：
	 * - 1: 包围球在截锥体内。
	 * - 2: 包围球与截锥体相交。
	 * - 0: 包围球在截锥体外且不相交。
	 */
	containsBoundSphere(sphere: BoundSphere): number {
		var result: number = Plane.PlaneIntersectionType_Front;
		var planeResult: number = Plane.PlaneIntersectionType_Front;
		for (var i: number = 0; i < 6; i++) {
			switch (i) {
				case 0:
					planeResult = CollisionUtils.intersectsPlaneAndSphere(this._near, sphere);
					break;
				case 1:
					planeResult = CollisionUtils.intersectsPlaneAndSphere(this._far, sphere);
					break;
				case 2:
					planeResult = CollisionUtils.intersectsPlaneAndSphere(this._left, sphere);
					break;
				case 3:
					planeResult = CollisionUtils.intersectsPlaneAndSphere(this._right, sphere);
					break;
				case 4:
					planeResult = CollisionUtils.intersectsPlaneAndSphere(this._top, sphere);
					break;
				case 5:
					planeResult = CollisionUtils.intersectsPlaneAndSphere(this._bottom, sphere);
					break;
			}

			switch (planeResult) {

				case Plane.PlaneIntersectionType_Back:
					return ContainmentType.Disjoint;
				case Plane.PlaneIntersectionType_Intersecting:
					result = Plane.PlaneIntersectionType_Intersecting;
					break;
			}
		}

		switch (result) {

			case Plane.PlaneIntersectionType_Intersecting:
				return ContainmentType.Intersects;
			default:
				return ContainmentType.Contains;
		}
	}

	/**
	 * @en Clones this frustum into another object.
	 * @param dest The destination BoundFrustum to copy the values into.
	 * @zh 克隆这个截锥体到另一个对象。
	 * @param dest 目标对象，用以复制值。
	 */
	cloneTo(dest: BoundFrustum) {
		dest.matrix = this.matrix;
	}

	/**
	 * @en Creates a clone of this frustum.
	 * @returns A new BoundFrustum that is a clone of this one.
	 * @zh 创建这个截锥体的克隆。
	 * @returns 一个克隆自当前截锥体的新的 BoundFrustum。
	 */
	clone(): BoundFrustum {
		let dest = new BoundFrustum(new Matrix4x4);
		this.cloneTo(dest);
		return dest;
	}
}

const _tempV30: Vector3 = new Vector3();
const _tempV31: Vector3 = new Vector3();
const _tempV32: Vector3 = new Vector3();
const _tempV33: Vector3 = new Vector3();
const _tempV34: Vector3 = new Vector3();
const _tempV35: Vector3 = new Vector3();
const _tempV36: Vector3 = new Vector3();