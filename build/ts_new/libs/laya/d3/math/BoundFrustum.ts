import { Vector3 } from "./Vector3";
import { Matrix4x4 } from "./Matrix4x4";
import { Plane } from "./Plane";
import { CollisionUtils } from "./CollisionUtils";
import { ContainmentType } from "./ContainmentType";
import { BoundBox } from "./BoundBox";
import { BoundSphere } from "./BoundSphere";

/**
 * @internal
 * 锥体角点。
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
 * <code>BoundFrustum</code> 类用于创建锥截体。
 */
export class BoundFrustum {
	/** @internal */
	private static _tempV30: Vector3 = new Vector3();
	/** @internal */
	private static _tempV31: Vector3 = new Vector3();
	/** @internal */
	private static _tempV32: Vector3 = new Vector3();
	/** @internal */
	private static _tempV33: Vector3 = new Vector3();
	/** @internal */
	private static _tempV34: Vector3 = new Vector3();
	/** @internal */
	private static _tempV35: Vector3 = new Vector3();
	/** @internal */
	private static _tempV36: Vector3 = new Vector3();

	/**
	 * 根据矩阵获取6个包围平面。
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
		np.normalize();

		//far
		var farNorE: Vector3 = fp.normal;
		farNorE.x = m14 - m13;
		farNorE.y = m24 - m23;
		farNorE.z = m34 - m33;
		fp.distance = m44 - m43;
		fp.normalize();

		//left
		var leftNorE: Vector3 = lp.normal;
		leftNorE.x = m14 + m11;
		leftNorE.y = m24 + m21;
		leftNorE.z = m34 + m31;
		lp.distance = m44 + m41;
		lp.normalize();

		//right
		var rightNorE: Vector3 = rp.normal;
		rightNorE.x = m14 - m11;
		rightNorE.y = m24 - m21;
		rightNorE.z = m34 - m31;
		rp.distance = m44 - m41;
		rp.normalize();

		//top
		var topNorE: Vector3 = tp.normal;
		topNorE.x = m14 - m12;
		topNorE.y = m24 - m22;
		topNorE.z = m34 - m32;
		tp.distance = m44 - m42;
		tp.normalize();

		//bottom
		var bottomNorE: Vector3 = bp.normal;
		bottomNorE.x = m14 + m12;
		bottomNorE.y = m24 + m22;
		bottomNorE.z = m34 + m32;
		bp.distance = m44 + m42;
		bp.normalize();
	}

	/** @internal */
	private _matrix: Matrix4x4;
	/** @internal */
	_near: Plane;
	/** @internal */
	_far: Plane;
	/** @internal */
	_left: Plane;
	/** @internal */
	_right: Plane;
	/** @internal */
	_top: Plane;
	/** @internal */
	_bottom: Plane;

	/**
	 * 创建一个 <code>BoundFrustum</code> 实例。
	 * @param	matrix 锥截体的描述4x4矩阵。
	 */
	constructor(matrix: Matrix4x4) {
		this._matrix = matrix;
		this._near = new Plane(new Vector3());
		this._far = new Plane(new Vector3());
		this._left = new Plane(new Vector3());
		this._right = new Plane(new Vector3());
		this._top = new Plane(new Vector3());
		this._bottom = new Plane(new Vector3());
		BoundFrustum.getPlanesFromMatrix(this._matrix, this._near, this._far, this._left, this._right, this._top, this._bottom);
	}

	/**
	 * 描述矩阵。
	 */
	get matrix(): Matrix4x4 {
		return this._matrix;
	}

	set matrix(matrix: Matrix4x4) {
		matrix.cloneTo(this._matrix)
		BoundFrustum.getPlanesFromMatrix(this._matrix, this._near, this._far, this._left, this._right, this._top, this._bottom);
	}

	/**
	 * 近平面。
	 */
	get near(): Plane {
		return this._near;
	}

	/**
	 * 远平面。
	 */
	get far(): Plane {
		return this._far;
	}

	/**
	 * 左平面。
	 */
	get left(): Plane {
		return this._left;
	}

	/**
	 * 右平面。
	 */
	get right(): Plane {
		return this._right;
	}

	/**
	 * 顶平面。
	 */
	get top(): Plane {
		return this._top;
	}

	/**
	 * 底平面。
	 */
	get bottom(): Plane {
		return this._bottom;
	}

	/**
	 * 判断是否与其他锥截体相等。
	 * @param	other 锥截体。
	 */
	equalsBoundFrustum(other: BoundFrustum): boolean {
		return this._matrix.equalsOtherMatrix(other.matrix)
	}

	/**
	 * 判断是否与其他对象相等。
	 * @param	obj 对象。
	 */
	equalsObj(obj: any): boolean {
		if (obj instanceof BoundFrustum) {
			var bf: BoundFrustum = (<BoundFrustum>obj);
			return this.equalsBoundFrustum(bf);
		}
		return false;
	}

	/**
	 * 获取锥截体的任意一平面。
	 * 0:近平面
	 * 1:远平面
	 * 2:左平面
	 * 3:右平面
	 * 4:顶平面
	 * 5:底平面
	 * @param	index 索引。
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
	 * 锥截体三个相交平面的交点。
	 * @param  p1  平面1。
	 * @param  p2  平面2。
	 * @param  p3  平面3。
	 */
	static get3PlaneInterPoint(p1: Plane, p2: Plane, p3: Plane, out: Vector3): void {
		var p1Nor: Vector3 = p1.normal;
		var p2Nor: Vector3 = p2.normal;
		var p3Nor: Vector3 = p3.normal;

		Vector3.cross(p2Nor, p3Nor, BoundFrustum._tempV30);
		Vector3.cross(p3Nor, p1Nor, BoundFrustum._tempV31);
		Vector3.cross(p1Nor, p2Nor, BoundFrustum._tempV32);

		var a: number = Vector3.dot(p1Nor, BoundFrustum._tempV30);
		var b: number = Vector3.dot(p2Nor, BoundFrustum._tempV31);
		var c: number = Vector3.dot(p3Nor, BoundFrustum._tempV32);

		Vector3.scale(BoundFrustum._tempV30, -p1.distance / a, BoundFrustum._tempV33);
		Vector3.scale(BoundFrustum._tempV31, -p2.distance / b, BoundFrustum._tempV34);
		Vector3.scale(BoundFrustum._tempV32, -p3.distance / c, BoundFrustum._tempV35);

		Vector3.add(BoundFrustum._tempV33, BoundFrustum._tempV34, BoundFrustum._tempV36);
		Vector3.add(BoundFrustum._tempV35, BoundFrustum._tempV36, out);
	}

	/**
	 * 锥截体的8个顶点。
	 * @param  corners  返回顶点的输出队列。
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
	 * 与点的关系。
	 * @param  point  点。
	 * @returns 包涵:1,相交:2,不相交:0
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
	 * 是否与包围盒交叉。
	 * @param box 包围盒。
	 * @returns boolean 是否相交
	 */
	intersects(box: BoundBox): boolean {
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
	 * 与包围盒的位置关系。
	 * @param  box  包围盒。
	 * @returns 包涵:1,相交:2,不相交:0
	 */
	containsBoundBox(box: BoundBox): number {
		var p: Vector3 = BoundFrustum._tempV30, n: Vector3 = BoundFrustum._tempV31;
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
	 * 与包围球的位置关系
	 * @param  sphere  包围球。
	 * @returns 包涵:1,相交:2,不相交:0
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
}


