import { Vector3 } from "../../../../d3/math/Vector3";
import { IShadowCullInfo } from "../../../RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { NativeBoundSphere } from "./NativeBoundsSphere";
import { NativePlane } from "./NativePlane";

export class NativeShadowCullInfo implements IShadowCullInfo{
    position: Vector3;
    cullPlanes: NativePlane[];
    cullSphere: NativeBoundSphere;
    cullPlaneCount: number;
    direction: Vector3;
}