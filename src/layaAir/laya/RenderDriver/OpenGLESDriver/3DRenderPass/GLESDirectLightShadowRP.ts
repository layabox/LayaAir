import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { RTCameraNodeData } from "../../RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleData";
import { RTDirectLight } from "../../RenderModuleData/RuntimeModuleData/3D/RTDirectLight";
import { GLESInternalRT } from "../RenderDevice/GLESInternalRT";


export class GLESDirectLightShadowRP {
    private _light: RTDirectLight;
    private _camera: RTCameraNodeData;
    private _destTarget: GLESInternalRT;
    private _shadowCasterCommanBuffer: CommandBuffer[];
    _nativeObj: any;
    public get light(): RTDirectLight {
        return this._light;
    }
    public set light(value: RTDirectLight) {
        this._light = value;
        this._nativeObj.setLight(value._nativeObj);
    }

    public get camera(): RTCameraNodeData {
        return this._camera;
    }
    public set camera(value: RTCameraNodeData) {
        this._camera = value;
        this._nativeObj.setCameraNodeData(value._nativeObj);
    }

    public get destTarget(): GLESInternalRT {
        return this._destTarget;
    }
    public set destTarget(value: GLESInternalRT) {
        this._destTarget = value;
        this._nativeObj.setRenderTarget(value._nativeObj, RenderClearFlag.Nothing);
    }

    constructor() {
        this._nativeObj = new (window as any).conchGLESDirectLightShadowCastRP();
    }

    destroy() {
        this._nativeObj = null;
        this._shadowCasterCommanBuffer && (this._shadowCasterCommanBuffer.length = 0);
        this._shadowCasterCommanBuffer = null;
        this._destTarget = null;
        this._camera = null;
        this._light = null;
    }

    public get shadowCasterCommanBuffer(): CommandBuffer[] {
        return this._shadowCasterCommanBuffer;
    }
    public set shadowCasterCommanBuffer(value: CommandBuffer[]) {
        this._shadowCasterCommanBuffer = value;
        this._nativeObj.clearShadowCasterCommandBuffer();
        value.forEach(element => {
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
}