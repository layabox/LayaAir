import { Bounds } from "../../d3/core/Bounds";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Transform3D } from "../../d3/core/Transform3D";
import { BoundSphere } from "../../d3/math/BoundSphere";
import { Plane } from "../../d3/math/Plane";
import { Vector3 } from "../../d3/math/Vector3";
import { DrawType } from "../RenderEnum/DrawType";
import { MeshTopology } from "../RenderEnum/RenderPologyMode";
import { ShaderData } from "../RenderShader/ShaderData";
import { IRenderElement } from "./RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "./RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "./RenderPipelineInterface/IRenderQueue";

export interface IRenderOBJCreate{
    createTransform(owner:Sprite3D):Transform3D;

    createBounds(min:Vector3,max:Vector3):Bounds;

    createBoundsSphere(center:Vector3,radius:number):BoundSphere;

    createPlane(normal:Vector3,d:number):Plane;

    createShaderData():ShaderData;

    createRenderElement():IRenderElement;

    createBaseRenderQueue(isTransparent:boolean):IRenderQueue;

    createRenderGeometry(mode:MeshTopology,drayType:DrawType):IRenderGeometryElement;

}