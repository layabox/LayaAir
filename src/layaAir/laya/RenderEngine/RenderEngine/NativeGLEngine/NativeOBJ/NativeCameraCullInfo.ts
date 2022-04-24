import { Vector3 } from "../../../../d3/math/Vector3";
import { ICameraCullInfo } from "../../../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { NativeBoundFrustum } from "./NativeBoundFrustum";

/**
 * camera裁剪数据
 */
 export class NativeCameraCullInfo implements ICameraCullInfo{
	/**位置 */
	position: Vector3;
	/**是否遮挡剔除 */
	useOcclusionCulling: Boolean;
	/**锥体包围盒 */
	boundFrustum: NativeBoundFrustum;
	/**遮挡标记 */
	cullingMask: number;
}