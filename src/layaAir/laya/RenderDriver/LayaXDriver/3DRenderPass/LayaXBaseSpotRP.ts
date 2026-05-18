import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Scene3D } from "../../../d3/core/scene/Scene3D";
import { RenderTexture } from "../../../resource/RenderTexture";
import { IRenderContext3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { LayaXSpotLight } from "../RenderModuleData/LayaXSpotLight";

export class LayaXBaseSpotRP {

    _nativeObj: any;
    private _destShadowRT: RenderTexture;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXBaseSpotRP();
    }

    setShadowCasterCommanBuffer(cmd: CommandBuffer[]): void {
        // TODO: forward to native when needed
    }

    setCameraCullInfo(sceneManager: ISceneRenderManager): void {
        this._nativeObj.setCameraCullInfo((sceneManager as any)._nativeObj);
    }

    setRPData(spotLight: LayaXSpotLight, context: IRenderContext3D): void {
        this._destShadowRT = Scene3D._shadowCasterPass.getSpotLightShadowPassData(spotLight as any);
        this._nativeObj.setRPData(
            spotLight._nativeObj,
            (context as any)._nativeObj,
            (this._destShadowRT._renderTarget as any)._nativeObj
        );
    }

    destroy() {
    }
}
