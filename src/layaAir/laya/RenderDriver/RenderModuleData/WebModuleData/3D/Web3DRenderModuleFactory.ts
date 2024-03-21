import { ShaderPass } from "../../../../RenderEngine/RenderShader/ShaderPass";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { BoundsImpl } from "../../../../d3/math/BoundsImpl";
import { Vector3 } from "../../../../maths/Vector3";
import { IPointLightData, IShaderPassData } from "../../Design/3D/I3DRenderModuleData";
import { I3DRenderModuleFactory } from "../../Design/3D/I3DRenderModuleFactory";
import { WebBaseRenderNode } from "./WebBaseRenderNode";
import { WebDirectLight } from "./WebDirectLight";
import { WebLightmap } from "./WebLightmap";
import { WebMeshRenderNode } from "./WebMeshRenderNode";
import { WebCameraNodeData, WebSceneNodeData, WebShaderPass, WebSubShader } from "./WebModuleData";
import { WebPointLight } from "./WebPointLight";
import { WebReflectionProbe } from "./WebReflectionProb";
import { WebSpotLight } from "./WebSpotLight";
import { WebVolumetricGI } from "./WebVolumetricGI";

export class Web3DRenderModuleFactory implements I3DRenderModuleFactory {
  createShaderPass(pass: ShaderPass): IShaderPassData {
    return new WebShaderPass(pass);
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

  createSubShader(): WebSubShader {
    return new WebSubShader();
  }

  createBaseRenderNode(): WebBaseRenderNode {
    return new WebBaseRenderNode();
  }

  createMeshRenderNode(): WebMeshRenderNode {
    return new WebMeshRenderNode();
  }

}