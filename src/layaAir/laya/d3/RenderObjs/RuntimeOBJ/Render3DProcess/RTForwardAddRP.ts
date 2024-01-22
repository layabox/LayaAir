import { IForwardAddRP } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddRP";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { RTDirectLightShadowCastRP } from "./RTDirectLightShadowRP";
import { RTForwardAddClusterRP } from "./RTForwardAddClusterRP";
import { RTSpotLightShadowRP } from "./RTSpotLightShadowRP";


export class RTForwardAddRP implements IForwardAddRP {
    public get shadowCastPass(): boolean {
        return this._nativeObj._shadowCastPass;
    }
    public set shadowCastPass(value: boolean) {
        this._nativeObj._shadowCastPass = value;
    }
    private _directLightShadowPass: RTDirectLightShadowCastRP;
    public get directLightShadowPass(): RTDirectLightShadowCastRP {
        return this._directLightShadowPass;
    }
    public set directLightShadowPass(value: RTDirectLightShadowCastRP) {
        this._directLightShadowPass = value;
        this._nativeObj.setDirectLightShadowPass(value._nativeObj);
    }
    public get enableDirectLightShadow(): boolean {
        return this._nativeObj._enableDirectLightShadow;
    }
    public set enableDirectLightShadow(value: boolean) {
        this._nativeObj._enableDirectLightShadow = value;
    }
    private _spotLightShadowPass: RTSpotLightShadowRP;
    public get spotLightShadowPass(): RTSpotLightShadowRP {
        return this._spotLightShadowPass;
    }
    public set spotLightShadowPass(value: RTSpotLightShadowRP) {
        this._spotLightShadowPass = value;
        this._nativeObj.setSpotLightShadowPass(value._nativeObj);
    }
    private _enableSpotLightShadowPass: boolean;
    public get enableSpotLightShadowPass(): boolean {
        return this._enableSpotLightShadowPass;
    }
    public set enableSpotLightShadowPass(value: boolean) {
        this._enableSpotLightShadowPass = value;
    }
    private _renderpass: RTForwardAddClusterRP;
    public get renderpass(): RTForwardAddClusterRP {
        return this._renderpass;
    }
    public set renderpass(value: RTForwardAddClusterRP) {
        this._renderpass = value;
        this._nativeObj.setSpotLightShadowPass(value._nativeObj);
    }

    setAfterEventCmd(value: CommandBuffer[]): void {
        throw new Error("Method not implemented.");
    }

    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTForwardAddRP();
        this.directLightShadowPass = new RTDirectLightShadowCastRP();
        this.spotLightShadowPass = new RTSpotLightShadowRP();
        this.renderpass = new RTForwardAddClusterRP();
    }
}