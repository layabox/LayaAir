import { Plane } from "../math/Plane";
import { Bounds } from "../math/Bounds";
import { Vector3 } from "../../maths/Vector3";

/**
 * @internal
 * @en The `FrustumCulling` class is used for performing frustum culling calculations to determine visibility of objects within the camera's view.
 * @zh `FrustumCulling` 类用于执行视锥体剔除计算，以确定对象是否在相机视图中可见。
 */
export class FrustumCulling {
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
		// Improve:Maybe use sphre and direction cull can savle the far plane cull
		for (var j: number = 0; j < cullPlaneCount; j++) {
			var plane: Plane = cullPlanes[j];
			var normal: Vector3 = plane.normal;
			if (plane.distance + (normal.x * (normal.x < 0.0 ? minX : maxX)) + (normal.y * (normal.y < 0.0 ? minY : maxY)) + (normal.z * (normal.z < 0.0 ? minZ : maxZ)) < 0.0) {
				pass = false;
				break;
			}
		}
		return pass;
	}
}

