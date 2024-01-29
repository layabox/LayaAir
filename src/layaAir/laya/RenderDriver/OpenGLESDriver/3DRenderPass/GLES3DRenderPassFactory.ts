import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { IIndexBuffer3D, IRenderElement3D, IVertexBuffer3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { GLESDirectLightShadowRP } from "./GLESDirectLightShadowRP";
import { GLESForwardAddClusterRP } from "./GLESForwardAddClusterRP";
import { GLESForwardAddRP } from "./GLESForwardAddRP";
import { GLESRender3DProcess } from "./GLESRender3DProcess";
import { GLESRenderContext3D } from "./GLESRenderContext3D";
import { GLESRenderElement3D } from "./GLESRenderElement3D";
import { GLESSkinRenderElement3D } from "./GLESSkinRenderElement3D";
import { GLESSpotLightShadowRP } from "./GLESSpotLightShadowRP";

export class GLES3DRenderPassFactory implements I3DRenderPassFactory {
    createSceneRenderManager(): ISceneRenderManager {
       return new SceneRenderManagerOBJ();
    }
    createSkinRenderElement(): IRenderElement3D {
      return new GLESSkinRenderElement3D();
    }

    createDirectLightShadowRP(): GLESDirectLightShadowRP {
        return new GLESDirectLightShadowRP();
    }

    createSpotLightShadowRP(): GLESSpotLightShadowRP {
        return new GLESSpotLightShadowRP();
    }

    createForwardAddRP(): GLESForwardAddRP {
        return new GLESForwardAddRP();
    }

    createForwardAddCluster(): GLESForwardAddClusterRP {
        return new GLESForwardAddClusterRP();
    }

    createRender3DProcess(): GLESRender3DProcess {
        return new GLESRender3DProcess();
    }

    createVertexBuffer3D(): IVertexBuffer3D {
        return null;
    }

    createIndexBuffer3D(): IIndexBuffer3D {
        return null;
    }

    createRenderContext3D(): GLESRenderContext3D {
        return new GLESRenderContext3D()
    }

    createRenderElement3D(): GLESRenderElement3D {
        return new GLESRenderElement3D();
    }
}