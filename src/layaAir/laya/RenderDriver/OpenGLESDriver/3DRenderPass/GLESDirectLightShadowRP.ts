import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { IDirectLightShadowRP } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { RTDirectLight } from "../../RenderModuleData/RuntimeModuleData/3D/RTDirectLight";
import { WebCameraNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";


export class GLESDirectLightShadowRP implements IDirectLightShadowRP {
    private _light: RTDirectLight;
    public get light(): RTDirectLight {
        return this._light;
    }
    public set light(value: RTDirectLight) {
        this._light = value;
        this._nativeObj.setLight(value._nativeObj);
    }
    private _camera: WebCameraNodeData;
    public get camera(): WebCameraNodeData {
        return this._camera;
    }
    public set camera(value: WebCameraNodeData) {
        this._camera = value;
        this._nativeObj.setCameraNodeData(value);
    }
    private _destTarget: InternalRenderTarget;
    public get destTarget(): InternalRenderTarget {
        return this._destTarget;
    }
    public set destTarget(value: InternalRenderTarget) {
        this._destTarget = value;
        this._nativeObj.setRenderTarget(value, RenderClearFlag.Nothing);
    }
    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTDirectLightShadowCastRP();
    }
    private _shadowCasterCommanBuffer: CommandBuffer[];
    public get shadowCasterCommanBuffer(): CommandBuffer[] {
        return this._shadowCasterCommanBuffer;
    }
    public set shadowCasterCommanBuffer(value: CommandBuffer[]) {
        this._shadowCasterCommanBuffer = value;
    }
}