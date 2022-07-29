import { RenderPlane } from "../../d3/core/RenderPlane";
import { BoundSphere } from "../../d3/math/BoundSphere";
import { Vector3 } from "../../d3/math/Vector3";
import { IShadowCullInfo } from "../RenderInterface/RenderPipelineInterface/IShadowCullInfo";

export class ShadowCullInfo implements IShadowCullInfo {
    position: Vector3;
    cullPlanes: RenderPlane[];
    cullSphere: BoundSphere;
    cullPlaneCount: number;
    direction: Vector3;
}