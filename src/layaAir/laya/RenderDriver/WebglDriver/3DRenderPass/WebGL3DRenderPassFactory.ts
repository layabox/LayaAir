
import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { IDirectLightShadowRP, ISpotLightShadowRP, IForwardAddRP, IForwardAddClusterRP, IRender3DProcess, IVertexBuffer3D, IIndexBuffer3D, IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebGLDirectLightShadowRP } from "./WebGLDirectLightShadowRP";
import { WebGLForwardAddClusterRP } from "./WebGLForwardAddClusterRP";
import { WebGLForwardAddRP } from "./WebGLForwardAddRP";
import { WebGLRender3DProcess } from "./WebGLRender3DProcess";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";
import { WebGLSkinRenderElement3D } from "./WebGLSkinRenderElement3D";
import { WebGLSpotLightShadowRP } from "./WebGLSpotLightShadowRP";

export class WebGL3DRenderPassFactory implements I3DRenderPassFactory {
    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }
    createSkinRenderElement(): IRenderElement3D {
        return new WebGLSkinRenderElement3D();
    }
    createRenderContext3D(): IRenderContext3D {
        return new WebGLRenderContext3D();
    }
    createRenderElement3D(): IRenderElement3D {
        return new WebGLRenderElement3D();
    }
    createDirectLightShadowRP(): IDirectLightShadowRP {
        return new WebGLDirectLightShadowRP();
    }
    createSpotLightShadowRP(): ISpotLightShadowRP {
        return new WebGLSpotLightShadowRP();
    }
    createForwardAddRP(): IForwardAddRP {
        return new WebGLForwardAddRP();
    }
    createForwardAddCluster(): IForwardAddClusterRP {
        return new WebGLForwardAddClusterRP();
    }
    createRender3DProcess(): IRender3DProcess {
        return new WebGLRender3DProcess();
    }
    createVertexBuffer3D(): IVertexBuffer3D {
        return null;//TODO
    }
    createIndexBuffer3D(): IIndexBuffer3D {
        return null;//TODO
    }

}