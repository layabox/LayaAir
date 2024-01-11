import { I3DRenderDriverPassFactory } from "../../RenderDriverLayer/I3DRenderDriverPassFactory";
import { IDirectLightShadowRP } from "../../RenderDriverLayer/Render3DProcess/IDirectLightShadowRP";
import { IForwardAddClusterRP } from "../../RenderDriverLayer/Render3DProcess/IForwardAddClusterRP";
import { IForwardAddRP } from "../../RenderDriverLayer/Render3DProcess/IForwardAddRP";
import { IRender3DProcess } from "../../RenderDriverLayer/Render3DProcess/IRender3DProcess";
import { ISpotLightShadowRP } from "../../RenderDriverLayer/Render3DProcess/ISpotLightShadowRP";
import { Laya3DRender } from "../Laya3DRender";
import { GLESDirectLightShadowCastRP } from "./Render3DProcess/GLESDirectLightShadowRP";
import { GLESForwardAddClusterRP } from "./Render3DProcess/GLESForwardAddClusterRP";
import { GLESForwardAddRP } from "./Render3DProcess/GLESForwardAddRP";
import { GLESRender3DProcess } from "./Render3DProcess/GLESRender3DProcess";
import { GLESSpotLightShadowRP } from "./Render3DProcess/GLESSpotLightShadowRP";

export class GLESRenderDriverPassFactory implements I3DRenderDriverPassFactory {
    createDirectLightShadowRP(): IDirectLightShadowRP {
        return new GLESDirectLightShadowCastRP();
    }
    createSpotLightShadowRP(): ISpotLightShadowRP {
        return new GLESSpotLightShadowRP();
    }
    createForwardAddRP(): IForwardAddRP {
        return new GLESForwardAddRP();
    }
    createForwardAddCluster(): IForwardAddClusterRP {
        return new GLESForwardAddClusterRP();
    }
    createRender3DProcess(): IRender3DProcess {
        return new GLESRender3DProcess();
    }

}
Laya3DRender.renderDriverPassCreate = new GLESRenderDriverPassFactory();