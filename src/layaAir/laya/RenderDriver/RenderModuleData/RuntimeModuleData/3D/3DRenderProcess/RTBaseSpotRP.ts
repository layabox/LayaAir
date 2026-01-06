import { SpotLightCom } from "../../../../../d3/core/light/SpotLightCom";
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { Scene3D } from "../../../../../d3/core/scene/Scene3D";
import { RenderClearFlag } from "../../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderTexture } from "../../../../../resource/RenderTexture";
import { IRenderContext3D } from "../../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { GLESInternalRT } from "../../../../OpenGLESDriver/RenderDevice/GLESInternalRT";
import { RTSpotLight } from "../RTSpotLight";


export class RTBaseSpotRP {

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRPBaseSpotRP();
    }

    setShadowCasterCommanBuffer(cmd: CommandBuffer[]): void {
        // this._shadowCasterCommanBuffer = cmd;
        //TODO
    }


    setCameraCullInfo(sceneManager: ISceneRenderManager): void {
        this._nativeObj.setCameraCullInfo((sceneManager as any)._nativeObj);
    }
    setRPData(spotLight: RTSpotLight, context: IRenderContext3D): void {
        let rt = Scene3D._shadowCasterPass.getSpotLightShadowPassData(spotLight);
        this._nativeObj.setRPData(spotLight._nativeObj, (context as any)._nativeObj, (rt._texture as any)._nativeObj);
    }

    destroy() {

    }
}