import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { Scene3D } from "../../../../../d3/core/scene/Scene3D";
import { RenderTexture } from "../../../../../resource/RenderTexture";
import { IRenderContext3D } from "../../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { RTCameraNodeData } from "../RT3DRenderModuleData";
import { RTDirectLight } from "../RTDirectLight";



export class RTDirCascadeShadowRP {

    _nativeObj: any;
    private _destShadowRT: RenderTexture;
    constructor() {
        this._nativeObj = new (window as any).conchRTDirCascadeShadowRP();
    }

    setShadowCasterCommanBuffer(cmd: CommandBuffer[]) {
        this._nativeObj.clearShadowCasterCommandBuffer();
        cmd.forEach(element => {
            this._setCmd(element);
        });
    }

    private _setCmd(cmd: CommandBuffer) {
        cmd._apply(false);
        let cmds = cmd._renderCMDs;
        let nativeobCMDs: any[] = [];
        cmds.forEach(element => {
            nativeobCMDs.push((element as any)._nativeObj);
        });
        this._nativeObj.addShadowCasterCommandBuffers(nativeobCMDs);
    }

    setRPData(dirLight: RTDirectLight, camera: RTCameraNodeData, context: IRenderContext3D): void {
        this._destShadowRT = Scene3D._shadowCasterPass.getDirectLightShadowMap(dirLight);
        this._nativeObj.setRPData(dirLight._nativeObj, camera._nativeObj, (context as any)._nativeObj, (this._destShadowRT._renderTarget as any)._nativeObj);
    }

    setCameraCullInfo(sceneManager: ISceneRenderManager): void {
        this._nativeObj.setCameraCullInfo((sceneManager as any)._nativeObj);
    }

    destroy() {
    }
}