import { Laya } from "../../../../Laya";
import { LayaEnv } from "../../../../LayaEnv";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Vector3 } from "../../../maths/Vector3";
import { IPointLightData, ISimpleSkinRenderNode, ISkinRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { I3DRenderModuleFactory } from "../../RenderModuleData/Design/3D/I3DRenderModuleFactory";
import { LayaXBounds } from "./LayaXBounds";
import { LayaXTransform3D } from "./LayaXTransform3D";
import { LayaXCameraNodeData } from "./LayaXCameraNodeData";
import { LayaXSceneNodeData } from "./LayaXSceneNodeData";
import { LayaXBaseRenderNode } from "./LayaXBaseRenderNode";
import { LayaXMeshRenderNode } from "./LayaXMeshRenderNode";
import { LayaXSkinRenderNode } from "./LayaXSkinRenderNode";
import { LayaXSimpleSkinRenderNode } from "./LayaXSimpleSkinRenderNode";
import { LayaXDirectLight } from "./LayaXDirectLight";
import { LayaXPointLight } from "./LayaXPointLight";
import { LayaXSpotLight } from "./LayaXSpotLight";
import { LayaXLightmapData } from "./LayaXLightmapData";
import { LayaXReflectionProbe } from "./LayaXReflectionProbe";
import { LayaXVolumetricGI } from "./LayaXVolumetricGI";

/**
 * LayaX 3D RenderModule factory.
 *
 * Creates LayaX-specific bridge objects that wrap `conchLayaX*` native classes.
 * All rendering is driven by the Rust RenderFeature; these objects serve as
 * the TS-side data bridge.
 */
export class LayaX3DRenderModuleFactory implements I3DRenderModuleFactory {

    createTransform(owner: Sprite3D): LayaXTransform3D {
        return new LayaXTransform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): LayaXBounds {
        return new LayaXBounds(min, max);
    }

    createVolumetricGI(): LayaXVolumetricGI {
        return new LayaXVolumetricGI();
    }

    createReflectionProbe(): LayaXReflectionProbe {
        return new LayaXReflectionProbe();
    }

    createLightmapData(): LayaXLightmapData {
        return new LayaXLightmapData();
    }

    createDirectLight(): LayaXDirectLight {
        return new LayaXDirectLight();
    }

    createSpotLight(): LayaXSpotLight {
        return new LayaXSpotLight();
    }

    createPointLight(): IPointLightData {
        return new LayaXPointLight();
    }

    createCameraModuleData(): LayaXCameraNodeData {
        return new LayaXCameraNodeData();
    }

    createSceneModuleData(): LayaXSceneNodeData {
        return new LayaXSceneNodeData();
    }

    createBaseRenderNode(): LayaXBaseRenderNode {
        return new LayaXBaseRenderNode();
    }

    createMeshRenderNode(): LayaXMeshRenderNode {
        return new LayaXMeshRenderNode();
    }

    createSkinRenderNode(): ISkinRenderNode {
        return new LayaXSkinRenderNode();
    }

    createSimpleSkinRenderNode(): ISimpleSkinRenderNode {
        return new LayaXSimpleSkinRenderNode();
    }
}

Laya.addBeforeInitCallback(() => {
    if (LayaEnv.isModernAPIs && !Laya3DRender.Render3DModuleDataFactory)
        Laya3DRender.Render3DModuleDataFactory = new LayaX3DRenderModuleFactory();
});
