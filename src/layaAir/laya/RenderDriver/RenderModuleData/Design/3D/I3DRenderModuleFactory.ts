import { ShaderPass } from "../../../../RenderEngine/RenderShader/ShaderPass";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { Vector3 } from "../../../../maths/Vector3";
import { IBaseRenderNode, ICameraNodeData, IDirectLightData, ILightMapData, IMeshRenderNode, IReflectionProbeData, ISceneNodeData, IShaderPassData, ISpotLightData, ISubshaderData, IVolumetricGIData } from "./I3DRenderModuleData";

export interface I3DRenderModuleFactory {
    createTransform(owner: Sprite3D): Transform3D;

    createBounds(min: Vector3, max: Vector3): any;

    createVolumetricGI(): IVolumetricGIData;

    createReflectionProbe(): IReflectionProbeData;

    createLightmapData(): ILightMapData;

    createDirectLight(): IDirectLightData;

    createSpotLight(): ISpotLightData;

    createCameraModuleData(): ICameraNodeData;

    createSceneModuleData(): ISceneNodeData;

    createSubShader(): ISubshaderData;

    createShaderPass(pass: ShaderPass): IShaderPassData;

    createBaseRenderNode(): IBaseRenderNode;

    createMeshRenderNode(): IMeshRenderNode;
}