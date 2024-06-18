import { ShaderPass } from "../../../../RenderEngine/RenderShader/ShaderPass";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { Vector3 } from "../../../../maths/Vector3";
import { IVolumetricGIData, IReflectionProbeData, ILightMapData, IDirectLightData, ISpotLightData, ICameraNodeData, ISceneNodeData, IBaseRenderNode, IMeshRenderNode, IPointLightData, ISkinRenderNode, ISimpleSkinRenderNode } from "./I3DRenderModuleData";

export interface I3DRenderModuleFactory {
    createTransform(owner: Sprite3D): Transform3D;

    createBounds(min: Vector3, max: Vector3): any;

    createVolumetricGI(): IVolumetricGIData;

    createReflectionProbe(): IReflectionProbeData;

    createLightmapData(): ILightMapData;

    createDirectLight(): IDirectLightData;

    createSpotLight(): ISpotLightData;

    createPointLight(): IPointLightData;

    createCameraModuleData(): ICameraNodeData;

    createSceneModuleData(): ISceneNodeData;
    //Render Node
    createBaseRenderNode(): IBaseRenderNode;

    createMeshRenderNode(): IMeshRenderNode;

    createSkinRenderNode(): ISkinRenderNode;

    createSimpleSkinRenderNode():ISimpleSkinRenderNode;
}