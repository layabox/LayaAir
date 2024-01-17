import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { ShaderData } from "../../../RenderEngine/RenderInterface/ShaderData";
import { Vector4 } from "../../../maths/Vector4";
import { Material } from "../../../resource/Material";
import { Transform3D } from "../../core/Transform3D";
import { IrradianceMode } from "../../core/render/BaseRender";
import { Bounds } from "../../math/Bounds";
import { IRenderContext3D } from "../IRenderContext3D";
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

    /**@internal */
    _renderUpdatePre: (context3D: IRenderContext3D) => void;

    /**@internal */
    _calculateBoundingBox: () => void;

    /**
     * @internal
     * @param value 
     */
    setWorldParams(value: Vector4): void;

    /**
     * @internal
     * @param value 
     */
    setRenderelements(value: IRenderElement[]): void;

    /**
     * @internal
     * @param value 
     */
    setLightmapScaleOffset(value: Vector4): void;

    /**
     * @internal
     * @param value 
     */
    setCommonUniformMap(value: string[]): void;

    /**
     * @internal
     * @param index 
     * @param mat 
     */
    setOneMaterial(index: number, mat: Material): void;

    /**
     * @override
     * @internal
     */
    destroy(): void;
}