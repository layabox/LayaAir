import { Matrix4x4 } from "../math/Matrix4x4"
	import { Ray } from "../math/Ray"
	import { Vector2 } from "../math/Vector2"
	import { Vector3 } from "../math/Vector3"
	import { Viewport } from "../math/Viewport"
	
	/**
	 * <code>Picker</code> 类用于创建拾取。
	 */
	export class Picker {
		private static _tempVector30:Vector3 = new Vector3();
		private static _tempVector31:Vector3 = new Vector3();
		private static _tempVector32:Vector3 = new Vector3();
		private static _tempVector33:Vector3 = new Vector3();
		private static _tempVector34:Vector3 = new Vector3();
		
		/**
		 * 创建一个 <code>Picker</code> 实例。
		 */
		constructor(){
		}
		
		/**
		 * 计算鼠标生成的射线。
		 * @param	point 鼠标位置。
		 * @param	viewPort 视口。
		 * @param	projectionMatrix 透视投影矩阵。
		 * @param	viewMatrix 视图矩阵。
		 * @param	world 世界偏移矩阵。
		 * @return  out  输出射线。
		 */
		 static calculateCursorRay(point:Vector2, viewPort:Viewport, projectionMatrix:Matrix4x4, viewMatrix:Matrix4x4, world:Matrix4x4, out:Ray):void {
			
			var x:number = point.x;
			var y:number = point.y;
			
			var nearSource:Vector3 = Picker._tempVector30;
			var nerSourceE:Vector3 = nearSource;
			nerSourceE.x = x;
			nerSourceE.y = y;
			nerSourceE.z = viewPort.minDepth;
			
			var farSource:Vector3 = Picker._tempVector31;
			var farSourceE:Vector3 = farSource;
			farSourceE.x = x;
			farSourceE.y = y;
			farSourceE.z = viewPort.maxDepth;
			
			var nearPoint:Vector3 = out.origin;
			var farPoint:Vector3 = Picker._tempVector32;
			
			viewPort.unprojectFromWVP(nearSource, projectionMatrix, viewMatrix, world, nearPoint);
			viewPort.unprojectFromWVP(farSource, projectionMatrix, viewMatrix, world, farPoint);
			
			var outDire:Vector3 = out.direction;
			outDire.x = farPoint.x - nearPoint.x;
			outDire.y = farPoint.y - nearPoint.y;
			outDire.z = farPoint.z - nearPoint.z;
			Vector3.normalize(out.direction, out.direction);
		}
		
		/**
		 * 计算射线和三角形碰撞并返回碰撞距离。
		 * @param	ray 射线。
		 * @param	vertex1 顶点1。
		 * @param	vertex2 顶点2。
		 * @param	vertex3 顶点3。
		 * @return   射线距离三角形的距离，返回Number.NaN则不相交。
		 */
		 static rayIntersectsTriangle(ray:Ray, vertex1:Vector3, vertex2:Vector3, vertex3:Vector3):number {
			
			var result:number;
			// Compute vectors along two edges of the triangle.
			var edge1:Vector3 = Picker._tempVector30, edge2:Vector3 = Picker._tempVector31;
			
			Vector3.subtract(vertex2, vertex1, edge1);
			Vector3.subtract(vertex3, vertex1, edge2);
			
			// Compute the determinant.
			var directionCrossEdge2:Vector3 = Picker._tempVector32;
			Vector3.cross(ray.direction, edge2, directionCrossEdge2);
			
			var determinant:number;
			determinant = Vector3.dot(edge1, directionCrossEdge2);
			
			// If the ray is parallel to the triangle plane, there is no collision.
			if (determinant > -Number.MIN_VALUE && determinant < Number.MIN_VALUE) {
				result = Number.NaN;
				return result;
			}
			
			var inverseDeterminant:number = 1.0 / determinant;
			
			// Calculate the U parameter of the intersection point.
			var distanceVector:Vector3 = Picker._tempVector33;
			Vector3.subtract(ray.origin, vertex1, distanceVector);
			
			var triangleU:number;
			triangleU = Vector3.dot(distanceVector, directionCrossEdge2);
			triangleU *= inverseDeterminant;
			
			// Make sure it is inside the triangle.
			if (triangleU < 0 || triangleU > 1) {
				result = Number.NaN;
				return result;
			}
			
			// Calculate the V parameter of the intersection point.
			var distanceCrossEdge1:Vector3 = Picker._tempVector34;
			Vector3.cross(distanceVector, edge1, distanceCrossEdge1);
			
			var triangleV:number;
			triangleV = Vector3.dot(ray.direction, distanceCrossEdge1);
			triangleV *= inverseDeterminant;
			
			// Make sure it is inside the triangle.
			if (triangleV < 0 || triangleU + triangleV > 1) {
				result = Number.NaN;
				return result;
			}
			
			// Compute the distance along the ray to the triangle.
			var rayDistance:number;
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
	
	}


