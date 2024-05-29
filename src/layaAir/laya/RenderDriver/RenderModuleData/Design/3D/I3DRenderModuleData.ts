import { Transform3D } from "../../../../d3/core/Transform3D";
import { ShadowCascadesMode } from "../../../../d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { IrradianceMode } from "../../../../d3/core/render/BaseRender";
import { AmbientMode } from "../../../../d3/core/scene/AmbientMode";
import { Bounds } from "../../../../d3/math/Bounds";
import { Color } from "../../../../maths/Color";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { IRenderElement3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IShaderInstance } from "../../../DriverDesign/RenderDevice/IShaderInstance";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../IDefineDatas";
import { RenderState } from "../RenderState";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Mesh } from "../../../../d3/resource/models/Mesh";
export enum BaseRenderType {
    BaseRender = 0,
    MeshRender = 1,
    ParticleRender = 2,
    TrailRender = 3,
    LineRender = 4,
    TerrainRender = 5,
    SkyRender = 7,
    SimpleSkinRender = 8,
    SkinnedMeshRender = 9,
}
//3D Render Node
export interface IBaseRenderNode {
    renderNodeType: number;//Flag
    transform: Transform3D;
    distanceForSort: number;
    sortingFudge: number;
    castShadow: boolean;
    receiveShadow: boolean;
    enable: boolean;
    renderbitFlag: number;
    layer: number;
    bounds: Bounds;
    baseGeometryBounds: Bounds;
    boundsChange: boolean;
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

    set_renderUpdatePreCall(call: any, fun: any): void;
    set_caculateBoundingBox(call: any, fun: any): void;


    /**
     * @internal
     * @param value 
     */
    setRenderelements(value: IRenderElement3D[]): void;

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

    // /**
    //  * @internal
    //  * @param index 
    //  * @param mat 
    //  */
    // setOneMaterial(index: number, mat: Material): void;

    /**
     * @override
     * @internal
     */
    destroy(): void;

    _applyLightProb(): void;

    _applyReflection(): void;
}

export interface IMeshRenderNode extends IBaseRenderNode {

}

export interface ISkinRenderNode extends IBaseRenderNode {
    computeSkinnedData(): void;
    setRootBoneTransfom(value: Sprite3D): void;
    setOwnerTransform(value: Sprite3D): void;
    setCacheMesh(cacheMesh: Mesh): void;
    setBones(value: Sprite3D[]): void;
    setSkinnedData(value: any[]): void;
}

export interface ISimpleSkinRenderNode extends IBaseRenderNode {
    setSimpleAnimatorParams(value: Vector4): void;
}

//Light
export interface IDirectLightData {
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowNearPlane: number;
    shadowCascadesMode: ShadowCascadesMode;
    shadowTwoCascadeSplits: number;
    setShadowFourCascadeSplits(value: Vector3): void;
    setDirection(value: Vector3): void;
}

export interface ISpotLightData {
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowNearPlane: number;
    spotRange: number;
    spotAngle: number;
    setDirection(value: Vector3): void;
}

export interface IPointLightData {
    transform: Transform3D;
    range: number;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowNearPlane: number;
}

export interface ILightMapData {
    /**@internal */
    lightmapColor: InternalTexture;
    /**@internal */
    lightmapDirection: InternalTexture;
    /**@internal */
    destroy(): void;
}

export interface IReflectionProbeData {
    /** @internal */
    _id: number;
    /**@internal */
    boxProjection: boolean;
    /**@internal */
    bound: Bounds;
    /**@internal */
    ambientMode: AmbientMode;
    /**@internal */
    ambientIntensity: number;
    /**@internal */
    reflectionIntensity: number;
    /**@internal */
    reflectionTexture: InternalTexture;//textureCube
    /**@internal */
    iblTex: InternalTexture;//textureCube
    /**@internal */
    updateMark: number;
    /**@internal */
    iblTexRGBD: boolean;
    /**@internal */
    setProbePosition(value: Vector3): void;
    /**@internal */
    setAmbientColor(value: Color): void;
    /**@internal */
    setAmbientSH(value: Float32Array): void;
    /**@internal */
    destroy(): void;
}

export interface IVolumetricGIData {
    _id: number;
    irradiance: InternalTexture;
    distance: InternalTexture;
    bound: Bounds;
    intensity: number;
    updateMark: number;
    setProbeCounts(value: Vector3): void;
    setProbeStep(value: Vector3): void;
    setParams(value: Vector4): void;
}

//global data
export interface ICameraNodeData {
    transform: Transform3D;
    farplane: number;
    nearplane: number;
    fieldOfView: number;
    aspectRatio: number;
    setProjectionViewMatrix(value: Matrix4x4): void;
}

export interface ISceneNodeData {
    lightmapDirtyFlag: number;
}



