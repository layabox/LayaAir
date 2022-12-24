import { Vector3 } from "../../../maths/Vector3";
import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { BoundFrustum } from "../../math/BoundFrustum";


/**
 * camera裁剪数据
 */
export class CameraCullInfo implements ICameraCullInfo {
	/**位置 */
	position: Vector3;
	/**是否遮挡剔除 */
	useOcclusionCulling: Boolean;
	/**锥体包围盒 */
	boundFrustum: BoundFrustum;
	/**遮挡标记 */
	cullingMask: number;
	/**静态标记 */
	staticMask: number;
}