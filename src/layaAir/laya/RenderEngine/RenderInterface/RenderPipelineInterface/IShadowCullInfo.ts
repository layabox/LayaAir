import { BoundSphere } from "../../../d3/math/BoundSphere";
import { Plane } from "../../../d3/math/Plane";
import { Vector3 } from "../../../d3/math/Vector3";

export interface IShadowCullInfo {
	position: Vector3;
	cullPlanes: Plane[];
	cullSphere: BoundSphere;
	cullPlaneCount: number;
	direction: Vector3;
}