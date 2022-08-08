import { Plane } from "../math/Plane";
import { Vector3 } from "../math/Vector3";
import { LayaGL } from "../../layagl/LayaGL";
import { ICameraCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { IShadowCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { RenderPlane } from "../core/RenderPlane";
import { Bounds } from "../math/Bounds";

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
	static debugFrustumCulling: boolean = false;

	/**
	 * @internal
	 */
	static __init__(): void {
		FrustumCulling._cameraCullInfo = LayaGL.renderOBJCreate.createCameraCullInfo();
		FrustumCulling._shadowCullInfo = LayaGL.renderOBJCreate.createShadowCullInfo();
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
		var cullPlanes: RenderPlane[] = cullInfo.cullPlanes;

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
}

