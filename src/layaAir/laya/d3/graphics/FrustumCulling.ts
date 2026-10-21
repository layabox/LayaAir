import { Plane } from "../math/Plane";
import { Bounds } from "../math/Bounds";
import { Vector3 } from "../../maths/Vector3";

/**
 * @internal
 * @en The `FrustumCulling` class is used for performing frustum culling calculations to determine visibility of objects within the camera's view.
 * @zh `FrustumCulling` 类用于执行视锥体剔除计算，以确定对象是否在相机视图中可见。
 */
export class FrustumCulling {

	// /**
	//  * @internal
	//  */
	// private static _drawTraversalCullingBound(renderList: SingletonList<ISingletonElement>, debugTool: PixelLineSprite3D): void {
	// 	var renders: ISingletonElement[] = renderList.elements;
	// 	for (var i: number = 0, n: number = renderList.length; i < n; i++) {
	// 		var color: Color = FrustumCulling._tempColor0;
	// 		color.r = 0;
	// 		color.g = 1;
	// 		color.b = 0;
	// 		color.a = 1;
	// 		Utils3D._drawBound(debugTool, ((<BaseRender>renders[i])).bounds._getBoundBox(), color);
	// 	}
	// }

	/**
	 * @en Calculates whether the given bounds are culled based on the provided culling information.
	 * @param bounds The bounds to test for culling.
	 * @param cullInfo The culling information containing plane data.
	 * @returns  True if the bounds are not culled and are therefore visible, otherwise false.
	 * @zh 根据提供的剔除信息，计算给定的边界是否被剔除。
	 * @param bounds 要测试剔除的边界。
	 * @param cullInfo 包含剔除平面数据的剔除信息。
	 * @returns 如果边界没有被剔除并且因此可见，则返回 true，否则返回 false。
	 */
	static cullingRenderBounds(bounds: Bounds, cullInfo: any): boolean {
		var cullPlaneCount: number = cullInfo.cullPlaneCount;
		var cullPlanes: Plane[] = cullInfo.cullPlanes;

		var min: Vector3 = bounds._imp.getMin();
		var max: Vector3 = bounds._imp.getMax();
		var minX: number = min.x;
		var minY: number = min.y;
		var minZ: number = min.z;
		var maxX: number = max.x;
		var maxY: number = max.y;
		var maxZ: number = max.z;
		//TODO:通过相机裁剪直接pass

		var pass: boolean = true;
		// cull by planes
		for (var j: number = 0; j < cullPlaneCount; j++) {
			var plane: Plane = cullPlanes[j];
			var normal: Vector3 = plane.normal;
			if (plane.distance + (normal.x * (normal.x < 0.0 ? minX : maxX)) + (normal.y * (normal.y < 0.0 ? minY : maxY)) + (normal.z * (normal.z < 0.0 ? minZ : maxZ)) < 0.0) {
				pass = false;
				break;
			}
		}
		if (!pass)
			return false;

		// Only directional cascades prepare this radius; other callers keep the plane test.
		const receiverRadius = cullInfo.receiverSphereCullingRadius;
		if (!(receiverRadius >= 0))
			return true;

		// Reuse the min/max values already read for the planes, without more bounds getters.
		const centerX = (minX + maxX) * 0.5;
		const centerY = (minY + maxY) * 0.5;
		const centerZ = (minZ + maxZ) * 0.5;
		const receiver = cullInfo.cullSphere.center;
		const direction = cullInfo.receiverSphereCullingDirection;
		let x = centerX - receiver.x;
		let y = centerY - receiver.y;
		let z = centerZ - receiver.z;
		const along = x * direction.x + y * direction.y + z * direction.z;
		// Upstream casters can be arbitrarily far away. Use the closest point on
		// their forward ray, avoiding the cancellation in |V|^2 - dot(V,D)^2.
		if (along < 0) {
			x -= along * direction.x;
			y -= along * direction.y;
			z -= along * direction.z;
		}
		const distanceSquared = x * x + y * y + z * z;
		// If the center ray reaches the receiver, the bounds cannot be culled.
		if (distanceSquared <= receiverRadius * receiverRadius)
			return true;

		const extentX = (maxX - minX) * 0.5;
		const extentY = (maxY - minY) * 0.5;
		const extentZ = (maxZ - minZ) * 0.5;
		if (extentX < 0 || extentY < 0 || extentZ < 0)
			return true;
		const casterRadiusSquared = extentX * extentX + extentY * extentY + extentZ * extentZ;
		// Cover floating-point receiver uniforms and large world coordinates.
		const epsilon = 1e-6 * Math.max(1, Math.abs(centerX), Math.abs(centerY), Math.abs(centerZ),
			Math.abs(receiver.x), Math.abs(receiver.y), Math.abs(receiver.z), extentX + extentY + extentZ, receiverRadius);
		const radius = receiverRadius + epsilon;
		const radiusSquared = radius * radius;
		const limit = radiusSquared + casterRadiusSquared;
		if (!Number.isFinite(distanceSquared) || !(distanceSquared > limit))
			return true;

		// d > R + sqrt(s) iff d^2 - R^2 - s > 0 and (d^2 - R^2 - s)^2 > 4 R^2 s.
		// No per-renderer square roots. The negated comparison also fails open on NaN/overflow.
		const delta = distanceSquared - limit;
		return !(delta * delta > 4 * radiusSquared * casterRadiusSquared);
	}

	// /**
	//  * caculate Bounds by ShadowCullInfo
	//  * @param bounds 
	//  * @param cullInfo 
	//  * @returns 
	//  */
	// static cullingRenderBoundsState(bounds: Bounds, cullInfo: ShadowCullInfo): ContainmentType {
	// 	var p: Vector3 = FrustumCulling._tempV30, n: Vector3 = FrustumCulling._tempV31;
	// 	var boxMin: Vector3 = bounds.min;
	// 	var boxMax: Vector3 = bounds.max;
	// 	var result: number = ContainmentType.Contains;
	// 	for (var i = 0, nn = cullInfo.cullPlaneCount; i < nn; i++) {
	// 		var plane: Plane = cullInfo.cullPlanes[i];
	// 		var planeNor: Vector3 = plane.normal;

	// 		if (planeNor.x >= 0) {
	// 			p.x = boxMax.x;
	// 			n.x = boxMin.x;
	// 		} else {
	// 			p.x = boxMin.x;
	// 			n.x = boxMax.x;
	// 		}
	// 		if (planeNor.y >= 0) {
	// 			p.y = boxMax.y;
	// 			n.y = boxMin.y;
	// 		} else {
	// 			p.y = boxMin.y;
	// 			n.y = boxMax.y;
	// 		}
	// 		if (planeNor.z >= 0) {
	// 			p.z = boxMax.z;
	// 			n.z = boxMin.z;
	// 		} else {
	// 			p.z = boxMin.z;
	// 			n.z = boxMax.z;
	// 		}

	// 		if (CollisionUtils.intersectsPlaneAndPoint(plane, p) === Plane.PlaneIntersectionType_Back)
	// 			return ContainmentType.Disjoint;

	// 		if (CollisionUtils.intersectsPlaneAndPoint(plane, n) === Plane.PlaneIntersectionType_Back)
	// 			result = ContainmentType.Intersects;
	// 	}
	// 	return result;
	// }


}

