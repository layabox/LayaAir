import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Scene3D } from "../../../d3/core/scene/Scene3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { RenderTexture } from "../../../resource/RenderTexture";
import { IRenderContext3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { LayaXDirectLight } from "../RenderModuleData/LayaXDirectLight";
import { LayaXCameraNodeData } from "../RenderModuleData/LayaXCameraNodeData";

export class LayaXDirCascadeShadowRP {

    _nativeObj: any;
    private _destShadowRT: RenderTexture;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXDirCascadeShadowRP();
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

    setRPData(dirLight: LayaXDirectLight, camera: LayaXCameraNodeData, context: IRenderContext3D): void {
        this._destShadowRT = Scene3D._shadowCasterPass.getDirectLightShadowMap(dirLight as any);
        this._nativeObj.setRPData(
            dirLight._nativeObj,
            camera._nativeObj,
            (context as any)._nativeObj,
            (this._destShadowRT._renderTarget as any)._nativeObj
        );

        // Pass light orientation (up/side/forward) to Rust for cascade VP computation
        if (dirLight.transform) {
            let lightWorld = Matrix4x4.TEMP;
            Matrix4x4.createFromQuaternion(dirLight.transform.rotation, lightWorld);
            let e = lightWorld.elements;
            dirLight._nativeObj.setOrientation(
                e[4], e[5], e[6],     // lightUp
                e[0], e[1], e[2],     // lightSide
                -e[8], -e[9], -e[10]  // lightForward
            );
        }
    }

    setCameraCullInfo(sceneManager: ISceneRenderManager): void {
        this._nativeObj.setCameraCullInfo((sceneManager as any)._nativeObj);
    }

    destroy() {
    }
}
