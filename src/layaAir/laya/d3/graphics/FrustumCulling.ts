import { Plane } from "../math/Plane";
import { ICameraCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { IShadowCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { Bounds } from "../math/Bounds";
import { ContainmentType } from "../math/ContainmentType";
import { CollisionUtils } from "../math/CollisionUtils";
import { Vector3 } from "../../maths/Vector3";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";

/**
 * @internal
 * <code>FrustumCulling</code> 类用于裁剪。
 */
export class FrustumCulling {
	/**@internal */
	static _cameraCullInfo: ICameraCullInfo;
	/**@internal */
	static _shadowCullInfo: IShadowCullInfo;
	/**@internal */
	private static _tempV30: Vector3 = new Vector3();
	/**@internal */
	private static _tempV31: Vector3 = new Vector3();

	/**
	 * @internal
	 */
	static __init__(): void {
		FrustumCulling._cameraCullInfo = Laya3DRender.renderOBJCreate.createCameraCullInfo();
		FrustumCulling._shadowCullInfo = Laya3DRender.renderOBJCreate.createShadowCullInfo();
	}

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
	 * caculate Bounds by ShadowCullInfo
	 * @param bounds 
	 * @param cullInfo 
	 * @returns 
	 */
	static cullingRenderBounds(bounds: Bounds, cullInfo: IShadowCullInfo): boolean {
		var cullPlaneCount: number = cullInfo.cullPlaneCount;
		var cullPlanes: Plane[] = cullInfo.cullPlanes;

		var min: Vector3 = bounds.getMin();
		var max: Vector3 = bounds.getMax();
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

	/**
	 * caculate Bounds by ShadowCullInfo
	 * @param bounds 
	 * @param cullInfo 
	 * @returns 
	 */
	static cullingRenderBoundsState(bounds: Bounds, cullInfo: IShadowCullInfo): ContainmentType {
		var p: Vector3 = FrustumCulling._tempV30, n: Vector3 = FrustumCulling._tempV31;
		var boxMin: Vector3 = bounds.min;
		var boxMax: Vector3 = bounds.max;
		var result: number = ContainmentType.Contains;
		for (var i = 0, nn = cullInfo.cullPlaneCount; i < nn; i++) {
			var plane: Plane = cullInfo.cullPlanes[i];
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


}

