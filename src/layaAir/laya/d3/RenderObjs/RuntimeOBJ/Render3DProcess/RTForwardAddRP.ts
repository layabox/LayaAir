import { IForwardAddRP } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddRP";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { RTDirectLightShadowCastRP } from "./RTDirectLightShadowRP";
import { RTForwardAddClusterRP } from "./RTForwardAddClusterRP";
import { RTSpotLightShadowRP } from "./RTSpotLightShadowRP";


export class RTForwardAddRP implements IForwardAddRP {
    private _shadowCastPass: boolean;
    public get shadowCastPass(): boolean {
        return this._shadowCastPass;
    }
    public set shadowCastPass(value: boolean) {
        this._shadowCastPass = value;
    }
    private _directLightShadowPass: RTDirectLightShadowCastRP;
    public get directLightShadowPass(): RTDirectLightShadowCastRP {
        return this._directLightShadowPass;
    }
    public set directLightShadowPass(value: RTDirectLightShadowCastRP) {
        this._directLightShadowPass = value;
    }
    private _enableDirectLightShadow: boolean;
    public get enableDirectLightShadow(): boolean {
        return this._enableDirectLightShadow;
    }
    public set enableDirectLightShadow(value: boolean) {
        this._enableDirectLightShadow = value;
    }
    private _spotLightShadowPass: RTSpotLightShadowRP;
    public get spotLightShadowPass(): RTSpotLightShadowRP {
        return this._spotLightShadowPass;
    }
    public set spotLightShadowPass(value: RTSpotLightShadowRP) {
        this._spotLightShadowPass = value;
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
    }

    setAfterEventCmd(value: CommandBuffer[]): void {
        throw new Error("Method not implemented.");
    }

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTForwardAddRP();
    }
}