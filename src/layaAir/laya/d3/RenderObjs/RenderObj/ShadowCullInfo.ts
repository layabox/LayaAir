import { Vector3 } from "../../../maths/Vector3";
import { BoundSphere } from "../../math/BoundSphere";
import { Plane } from "../../math/Plane";

export class ShadowCullInfo{
    position: Vector3;
    cullPlanes: Plane[];
    cullSphere: BoundSphere;
    cullPlaneCount: number;
    direction: Vector3;
}