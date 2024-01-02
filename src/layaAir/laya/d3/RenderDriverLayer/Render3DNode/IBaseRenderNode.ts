import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Vector4 } from "../../../maths/Vector4";
import { Material } from "../../../resource/Material";
import { Transform3D } from "../../core/Transform3D";
import { IrradianceMode } from "../../core/render/BaseRender";
import { Bounds } from "../../math/Bounds";
import { ILightMapData } from "../RenderModuleData/ILightMapData";
import { IReflectionProbeData } from "../RenderModuleData/IReflectionProbeData";
import { IVolumetricGIData } from "../RenderModuleData/IVolumetricGIData";

export interface IBaseRenderNode {
    transform: Transform3D;
    distanceForSort: number;
    sortingFudge: number;
    castShadow: boolean;
    enable: boolean;
    renderbitFlag: number;
    layer: number;
    bounds: Bounds;
    baseGeometryBounds: Bounds;
    boundsChange: boolean;
    customCull: boolean;
    customCullResoult: boolean;
    staticMask: number;
    shaderData: ShaderData;
    lightmapIndex: number;
    lightmap: ILightMapData;
    probeReflection: IReflectionProbeData;
    probeReflectionUpdateMark: number;
    reflectionMode: number;
    volumetricGI: IVolumetricGIData;
    lightProbUpdateMark: number;
    irradientMode: IrradianceMode;
    setWorldParams(value: Vector4): void;

    setRenderelements(value: IRenderElement[]): void;

    setLightmapScaleOffset(value: Vector4): void;

    setCommonUniformMap(value: string[]): void;
    //
    setOneMaterial(index: number, mat: Material): void;

    destroy(): void;
}