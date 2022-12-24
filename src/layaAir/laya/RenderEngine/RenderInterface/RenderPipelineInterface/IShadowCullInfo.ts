import { BoundSphere } from "../../../d3/math/BoundSphere";
import { Plane } from "../../../d3/math/Plane";
import { Vector3 } from "../../../maths/Vector3";

export interface IShadowCullInfo {
	position: Vector3;
	cullPlanes: Plane[];
	cullSphere: BoundSphere;
	cullPlaneCount: number;
	direction: Vector3;
}