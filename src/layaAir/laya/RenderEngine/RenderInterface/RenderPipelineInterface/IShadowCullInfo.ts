import { RenderPlane } from "../../../d3/core/RenderPlane";
import { BoundSphere } from "../../../d3/math/BoundSphere";
import { Vector3 } from "../../../d3/math/Vector3";

export interface IShadowCullInfo {
	position: Vector3;
	cullPlanes: RenderPlane[];
	cullSphere: BoundSphere;
	cullPlaneCount: number;
	direction: Vector3;
}