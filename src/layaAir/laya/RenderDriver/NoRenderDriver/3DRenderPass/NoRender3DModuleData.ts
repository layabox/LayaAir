import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Bounds } from "../../../d3/math/Bounds";
import { BoundsImpl } from "../../../d3/math/BoundsImpl";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderModuleFactory } from "../../RenderModuleData/Design/3D/I3DRenderModuleFactory";
import {
    IBaseRenderNode, IMeshRenderNode, ISkinRenderNode, ISimpleSkinRenderNode,
    IDirectLightData, ISpotLightData, IPointLightData, ILightMapData,
    IReflectionProbeData, IVolumetricGIData, ICameraNodeData, ISceneNodeData,
    ENodeCustomData
} from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { Mesh } from "../../../d3/resource/models/Mesh";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { ShadowCascadesMode } from "../../../d3/core/light/ShadowCascadesMode";
import { AmbientMode } from "../../../d3/core/scene/AmbientMode";
import { IrradianceMode } from "../../../d3/core/render/BaseRender";

// ─── Light Data ───

class NoRenderDirectLight implements IDirectLightData {
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
    setShadowFourCascadeSplits(value: Vector3): void { }
    setDirection(value: Vector3): void { }
}

class NoRenderSpotLight implements ISpotLightData {
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
    setDirection(value: Vector3): void { }
}

class NoRenderPointLight implements IPointLightData {
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

class NoRenderLightmapData implements ILightMapData {
    lightmapColor: InternalTexture;
    lightmapDirection: InternalTexture;
    destroy(): void { }
}

class NoRenderReflectionProbe implements IReflectionProbeData {
    _id: number;
    boxProjection: boolean;
    bound: Bounds;
    ambientMode: AmbientMode;
    ambientIntensity: number;
    reflectionIntensity: number;
    reflectionTexture: InternalTexture;
    iblTex: InternalTexture;
    updateMark: number;
    iblTexRGBD: boolean;
    shaderData: ShaderData;
    setProbePosition(value: Vector3): void { }
    setAmbientColor(value: Color): void { }
    setAmbientSH(value: Float32Array): void { }
    destroy(): void { }
}

class NoRenderVolumetricGI implements IVolumetricGIData {
    _id: number;
    irradiance: InternalTexture;
    distance: InternalTexture;
    bound: Bounds;
    intensity: number;
    updateMark: number;
    shaderData: ShaderData;
    constructor() {
        this.bound = new Bounds();
    }

    setProbeCounts(value: Vector3): void { }
    setProbeStep(value: Vector3): void { }
    setParams(value: Vector4): void { }
    destroy(): void { }
}

// ─── Camera / Scene ───

class NoRenderCameraNodeData implements ICameraNodeData {
    transform: Transform3D;
    farplane: number;
    nearplane: number;
    fieldOfView: number;
    aspectRatio: number;
    setProjectionViewMatrix(value: Matrix4x4): void { }
}

class NoRenderSceneNodeData implements ISceneNodeData {
    lightmapDirtyFlag: number;
}

// ─── Render Nodes ───

class NoRenderBaseRenderNode implements IBaseRenderNode {
    renderNodeType: number;
    transform: Transform3D;
    distanceForSort: number;
    sortingFudge: number;
    castShadow: boolean;
    receiveShadow: boolean;
    enable: boolean;
    renderbitFlag: number;
    visibalRangeBit: number;
    visibalMin: number;
    visibalMax: number;
    layer: number;
    bounds: Bounds;
    baseGeometryBounds: Bounds;
    boundsChange: boolean;
    staticMask: number;
    shaderData: ShaderData;
    additionShaderData: Map<string, ShaderData> = new Map();
    lightmapIndex: number;
    lightmap: ILightMapData;
    probeReflection: IReflectionProbeData;
    reflectionMode: number;
    volumetricGI: IVolumetricGIData;
    lightProbUpdateMark: number;
    irradientMode: IrradianceMode;
    ismoved: Vector2 = new Vector2();
    perCameraUpdate: boolean = false;
    set_renderUpdatePreCall(call: any, fun: any): void { }
    set_caculateBoundingBox(call: any, fun: any): void { }
    setRenderelements(value: IRenderElement3D[]): void { }
    setLightmapScaleOffset(value: Vector4): void { }
    setCommonUniformMap(value: string[]): void { }
    setNodeCustomData(dataSlot: ENodeCustomData, data: number): void { }
    _applyLightProb(): void { }
    _applyReflection(): void { }
    destroy(): void { this.additionShaderData = null; }
}

class NoRenderMeshRenderNode extends NoRenderBaseRenderNode implements IMeshRenderNode {
}

class NoRenderSkinRenderNode extends NoRenderMeshRenderNode implements ISkinRenderNode {
    computeSkinnedData(): void { }
    setRootBoneTransfom(value: Sprite3D): void { }
    setOwnerTransform(value: Sprite3D): void { }
    setCacheMesh(cacheMesh: Mesh): void { }
    setBones(value: Sprite3D[]): void { }
    setSkinnedData(value: any[]): void { }
}

class NoRenderSimpleSkinRenderNode extends NoRenderBaseRenderNode implements ISimpleSkinRenderNode {
    setSimpleAnimatorParams(value: Vector4): void { }
}

// ─── Factory ───

export class NoRender3DModuleFactory implements I3DRenderModuleFactory {
    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new BoundsImpl(min, max);
    }

    createVolumetricGI(): IVolumetricGIData {
        return new NoRenderVolumetricGI();
    }

    createReflectionProbe(): IReflectionProbeData {
        return new NoRenderReflectionProbe();
    }

    createLightmapData(): ILightMapData {
        return new NoRenderLightmapData();
    }

    createDirectLight(): IDirectLightData {
        return new NoRenderDirectLight();
    }

    createSpotLight(): ISpotLightData {
        return new NoRenderSpotLight();
    }

    createPointLight(): IPointLightData {
        return new NoRenderPointLight();
    }

    createCameraModuleData(): ICameraNodeData {
        return new NoRenderCameraNodeData();
    }

    createSceneModuleData(): ISceneNodeData {
        return new NoRenderSceneNodeData();
    }

    createBaseRenderNode(): IBaseRenderNode {
        return new NoRenderBaseRenderNode();
    }

    createMeshRenderNode(): IMeshRenderNode {
        return new NoRenderMeshRenderNode();
    }

    createSkinRenderNode(): ISkinRenderNode {
        return new NoRenderSkinRenderNode();
    }

    createSimpleSkinRenderNode(): ISimpleSkinRenderNode {
        return new NoRenderSimpleSkinRenderNode();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DModuleDataFactory) {
        Laya3DRender.Render3DModuleDataFactory = new NoRender3DModuleFactory();
    }
});
