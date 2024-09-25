import { stat } from "fs";
import { Laya } from "../../../../../Laya";
import { Laya3DRender } from "../../../../d3/RenderObjs/Laya3DRender";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { BoundsImpl } from "../../../../d3/math/BoundsImpl";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector3 } from "../../../../maths/Vector3";
import { Stat } from "../../../../utils/Stat";
import { IPointLightData, ISimpleSkinRenderNode, ISkinRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { I3DRenderModuleFactory } from "../../Design/3D/I3DRenderModuleFactory";
import { WebBaseRenderNode } from "./WebBaseRenderNode";
import { WebDirectLight } from "./WebDirectLight";
import { WebLightmap } from "./WebLightmap";
import { WebMeshRenderNode } from "./WebMeshRenderNode";
import { WebCameraNodeData, WebSceneNodeData } from "./WebModuleData";
import { WebPointLight } from "./WebPointLight";
import { WebReflectionProbe } from "./WebReflectionProb";
import { WebSimpleSkinRenderNode } from "./WebSimpleSkinRenderNode";
import { WebSkinRenderNode } from "./WebSkinRenderNode";
import { WebSpotLight } from "./WebSpotLight";
import { WebVolumetricGI } from "./WebVolumetricGI";

export class Web3DRenderModuleFactory implements I3DRenderModuleFactory {
  createSimpleSkinRenderNode(): ISimpleSkinRenderNode {
    return new WebSimpleSkinRenderNode();
  }

  createTransform(owner: Sprite3D): Transform3D {
    return new Transform3D(owner);
  }

  createBounds(min: Vector3, max: Vector3): BoundsImpl {
    return new BoundsImpl(min, max);
  }

  createVolumetricGI(): WebVolumetricGI {
    return new WebVolumetricGI();
  }

  createReflectionProbe(): WebReflectionProbe {
    return new WebReflectionProbe();
  }

  createLightmapData(): WebLightmap {
    return new WebLightmap();
  }

  createDirectLight(): WebDirectLight {
    return new WebDirectLight();
  }

  createSpotLight(): WebSpotLight {
    return new WebSpotLight();
  }

  createPointLight(): IPointLightData {
    return new WebPointLight();
  }

  createCameraModuleData(): WebCameraNodeData {
    return new WebCameraNodeData();
  }

  createSceneModuleData(): WebSceneNodeData {
    return new WebSceneNodeData();
  }



  createBaseRenderNode(): WebBaseRenderNode {

    let renderNode = new WebBaseRenderNode();
    if (Stat.enableRenderPassStatArray) {
      renderNode._renderUpdatePre = renderNode._renderUpdatePre_StatUse;
    }
    return renderNode;
  }

  createMeshRenderNode(): WebMeshRenderNode {
    return new WebMeshRenderNode();
  }

  createSkinRenderNode(): ISkinRenderNode {
    return new WebSkinRenderNode();
  }

}


Laya.addBeforeInitCallback(() => {
  if (!Laya3DRender.Render3DModuleDataFactory) {
    Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
  }
})