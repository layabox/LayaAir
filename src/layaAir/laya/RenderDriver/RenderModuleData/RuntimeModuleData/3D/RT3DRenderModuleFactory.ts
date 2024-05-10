import { Laya } from "../../../../../Laya";
import { Laya3DRender } from "../../../../d3/RenderObjs/Laya3DRender";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Vector3 } from "../../../../maths/Vector3";
import { IPointLightData, ISkinRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { I3DRenderModuleFactory } from "../../Design/3D/I3DRenderModuleFactory";
import { NativeBounds } from "./NativeBounds";
import { NativeTransform3D } from "./NativeTransform3D";
import { RTCameraNodeData, RTSceneNodeData } from "./RT3DRenderModuleData";
import { RTBaseRenderNode } from "./RTBaseRenderNode";
import { RTDirectLight } from "./RTDirectLight";
import { RTLightmapData } from "./RTLightmap";
import { RTMeshRenderNode } from "./RTMeshRenderNode";
import { RTPointLight } from "./RTPointLight";
import { RTReflectionProb } from "./RTReflectionProb";
import { RTSkinRenderNode } from "./RTSkinRenderNode";
import { RTSpotLight } from "./RTSpotLight";
import { RTVolumetricGI } from "./RTVolumetricGI";

export class RT3DRenderModuleFactory implements I3DRenderModuleFactory {

    createTransform(owner: Sprite3D): NativeTransform3D {
        return new NativeTransform3D(owner);
    }
    createBounds(min: Vector3, max: Vector3): NativeBounds {
        return new NativeBounds(min, max);
    }
    createVolumetricGI(): RTVolumetricGI {
        return new RTVolumetricGI();
    }
    createReflectionProbe(): RTReflectionProb {
        return new RTReflectionProb();
    }
    createLightmapData(): RTLightmapData {
        return new RTLightmapData();
    }
    createDirectLight(): RTDirectLight {
        return new RTDirectLight();
    }
    createSpotLight(): RTSpotLight {
        return new RTSpotLight();
    }
    createPointLight(): IPointLightData {
        return new RTPointLight();
    }
    createCameraModuleData(): RTCameraNodeData {
        return new RTCameraNodeData();
    }
    createSceneModuleData(): RTSceneNodeData {
        return new RTSceneNodeData();
    }

    createBaseRenderNode(): RTBaseRenderNode {
        return new RTBaseRenderNode();
    }
    createMeshRenderNode(): RTMeshRenderNode {
        return new RTMeshRenderNode();
    }

    createSkinRenderNode(): ISkinRenderNode {
        return new RTSkinRenderNode();
    }

}

Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DModuleDataFactory)
        Laya3DRender.Render3DModuleDataFactory = new RT3DRenderModuleFactory();
})