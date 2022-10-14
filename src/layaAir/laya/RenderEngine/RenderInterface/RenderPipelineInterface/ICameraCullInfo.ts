import { BoundFrustum } from "../../../d3/math/BoundFrustum";
import { Vector3 } from "../../../d3/math/Vector3";

export interface ICameraCullInfo {
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