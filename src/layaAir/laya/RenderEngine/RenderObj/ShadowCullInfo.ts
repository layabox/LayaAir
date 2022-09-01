import { BoundSphere } from "../../d3/math/BoundSphere";
import { Plane } from "../../d3/math/Plane";
import { Vector3 } from "../../d3/math/Vector3";
import { IShadowCullInfo } from "../RenderInterface/RenderPipelineInterface/IShadowCullInfo";

export class ShadowCullInfo implements IShadowCullInfo {
    position: Vector3;
    cullPlanes: Plane[];
    cullSphere: BoundSphere;
    cullPlaneCount: number;
    direction: Vector3;
}