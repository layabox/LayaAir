
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Viewport } from "../../maths/Viewport";
import { Plane } from "../math/Plane"
import { Ray } from "../math/Ray"

/**
 * @en Picker class used to create picking.
 * @zh Picker 类用于创建拾取。
 */
export class Picker {
	/** @ignore */
	constructor() {
	}

	/**
	 * @en Calculates a ray originating from the mouse position.
	 * @param point The mouse position in screen space.
	 * @param viewPort The viewport dimensions.
	 * @param projectionMatrix The projection (perspective) matrix.
	 * @param viewMatrix The view matrix.
	 * @param world The world offset matrix.
	 * @param out The output ray.
	 * @zh 根据鼠标位置计算射线。
	 * @param point 屏幕空间中的鼠标位置。
	 * @param viewPort 视口尺寸。
	 * @param projectionMatrix 投影（透视）矩阵。
	 * @param viewMatrix 视图矩阵。
	 * @param world 世界偏移矩阵。
	 * @param out 输出射线。
	 */
	static calculateCursorRay(point: Vector2, viewPort: Viewport, projectionMatrix: Matrix4x4, viewMatrix: Matrix4x4, world: Matrix4x4, out: Ray): void {

		var x: number = point.x;
		var y: number = point.y;

		var nearSource: Vector3 = _tempVector30;
		var nerSourceE: Vector3 = nearSource;
		nerSourceE.x = x;
		nerSourceE.y = y;
		nerSourceE.z = viewPort.minDepth;

		var farSource: Vector3 = _tempVector31;
		var farSourceE: Vector3 = farSource;
		farSourceE.x = x;
		farSourceE.y = y;
		farSourceE.z = viewPort.maxDepth;

		var nearPoint: Vector3 = out.origin;
		var farPoint: Vector3 = _tempVector32;

		viewPort.unprojectFromWVP(nearSource, projectionMatrix, viewMatrix, world, nearPoint);
		viewPort.unprojectFromWVP(farSource, projectionMatrix, viewMatrix, world, farPoint);

		var outDire: Vector3 = out.direction;
		outDire.x = farPoint.x - nearPoint.x;
		outDire.y = farPoint.y - nearPoint.y;
		outDire.z = farPoint.z - nearPoint.z;
		Vector3.normalize(out.direction, out.direction);
	}

	/**
	 * @en Calculates the intersection of a ray with a triangle and returns the intersection distance.
	 * @param ray The ray.
	 * @param vertex1 The first vertex of the triangle.
	 * @param vertex2 The second vertex of the triangle.
	 * @param vertex3 The third vertex of the triangle.
	 * @returns The distance from the ray to the triangle, or `Number.NaN` if there is no intersection.
	 * @zh 计算射线与三角形的交点并返回交点距离。
	 * @param ray 射线。
	 * @param vertex1 三角形的第一个顶点。
	 * @param vertex2 三角形的第二个顶点。
	 * @param vertex3 三角形的第三个顶点。
	 * @returns 射线到三角形的距离，如果没有交点则返回 `Number.NaN`。
	 */
	static rayIntersectsTriangle(ray: Ray, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3): number {

		var result: number;
		// Compute vectors along two edges of the triangle.
		var edge1: Vector3 = _tempVector30, edge2: Vector3 = _tempVector31;

		Vector3.subtract(vertex2, vertex1, edge1);
		Vector3.subtract(vertex3, vertex1, edge2);

		// Compute the determinant.
		var directionCrossEdge2: Vector3 = _tempVector32;
		Vector3.cross(ray.direction, edge2, directionCrossEdge2);

		var determinant: number;
		determinant = Vector3.dot(edge1, directionCrossEdge2);

		// If the ray is parallel to the triangle plane, there is no collision.
		if (determinant > -Number.MIN_VALUE && determinant < Number.MIN_VALUE) {
			result = Number.NaN;
			return result;
		}

		var inverseDeterminant: number = 1.0 / determinant;

		// Calculate the U parameter of the intersection point.
		var distanceVector: Vector3 = _tempVector33;
		Vector3.subtract(ray.origin, vertex1, distanceVector);

		var triangleU: number;
		triangleU = Vector3.dot(distanceVector, directionCrossEdge2);
		triangleU *= inverseDeterminant;

		// Make sure it is inside the triangle.
		if (triangleU < 0 || triangleU > 1) {
			result = Number.NaN;
			return result;
		}

		// Calculate the V parameter of the intersection point.
		var distanceCrossEdge1: Vector3 = _tempVector34;
		Vector3.cross(distanceVector, edge1, distanceCrossEdge1);

		var triangleV: number;
		triangleV = Vector3.dot(ray.direction, distanceCrossEdge1);
		triangleV *= inverseDeterminant;

		// Make sure it is inside the triangle.
		if (triangleV < 0 || triangleU + triangleV > 1) {
			result = Number.NaN;
			return result;
		}

		// Compute the distance along the ray to the triangle.
		var rayDistance: number;
		rayDistance = Vector3.dot(edge2, distanceCrossEdge1);
		rayDistance *= inverseDeterminant;

		// Is the triangle behind the ray origin?
		if (rayDistance < 0) {
			result = Number.NaN;
			return result;
		}

		result = rayDistance;
		return result;
	}

	/**
	 * @en Detects the intersection point between a ray and a plane.
	 * @param ray The ray.
	 * @param plane The plane.
	 * @returns The intersection point, or `null` if there is no intersection.
	 * @zh 检测射线和平面的交点。
	 * @param ray 射线。
	 * @param plane 平面。
	 * @returns 交点，如果没有交点则返回 `null`。
	 */
	static rayPlaneIntersection(ray: Ray, plane: Plane): Vector3 {
		let point = new Vector3();
		let ddotn = Vector3.dot(ray.direction.normalize(), plane.normal.normalize());
		if (ddotn == 0) {
			return null;
		}

		let t = (-plane.distance - Vector3.dot(ray.origin, plane.normal)) / ddotn;
		if (t < 0)
			return null;
		ray.at(t, point);
		return point;
	}
}

const _tempVector30: Vector3 = new Vector3();
const _tempVector31: Vector3 = new Vector3();
const _tempVector32: Vector3 = new Vector3();
const _tempVector33: Vector3 = new Vector3();
const _tempVector34: Vector3 = new Vector3();
