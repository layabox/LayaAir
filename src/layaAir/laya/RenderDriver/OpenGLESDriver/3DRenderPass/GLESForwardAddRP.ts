import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { IRenderCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { GLESDirectLightShadowRP } from "./GLESDirectLightShadowRP";
import { GLESForwardAddClusterRP } from "./GLESForwardAddClusterRP";
import { GLESSpotLightShadowRP } from "./GLESSpotLightShadowRP";


export class GLESForwardAddRP {
    public get shadowCastPass(): boolean {
        return this._nativeObj.shadowCastPass;
    }
    public set shadowCastPass(value: boolean) {
        this._nativeObj.shadowCastPass = value;
    }
    private _directLightShadowPass: GLESDirectLightShadowRP;
    public get directLightShadowPass(): GLESDirectLightShadowRP {
        return this._directLightShadowPass;
    }
    public set directLightShadowPass(value: GLESDirectLightShadowRP) {
        this._directLightShadowPass = value;
        this._nativeObj.setDirectLightShadowPass(value._nativeObj);
    }
    public get enableDirectLightShadow(): boolean {
        return this._nativeObj.enableDirectLightShadow;
    }
    public set enableDirectLightShadow(value: boolean) {
        this._nativeObj.enableDirectLightShadow = value;
    }
    private _spotLightShadowPass: GLESSpotLightShadowRP;
    public get spotLightShadowPass(): GLESSpotLightShadowRP {
        return this._spotLightShadowPass;
    }
    public set spotLightShadowPass(value: GLESSpotLightShadowRP) {
        this._spotLightShadowPass = value;
        this._nativeObj.setSpotLightShadowPass(value._nativeObj);
    }
    public get enableSpotLightShadowPass(): boolean {
        return this._nativeObj.enableSpotLightShadowPass;
    }
    public set enableSpotLightShadowPass(value: boolean) {
        this._nativeObj.enableSpotLightShadowPass = value;
    }
    private _renderpass: GLESForwardAddClusterRP;
    public get renderpass(): GLESForwardAddClusterRP {
        return this._renderpass;
    }
    public set renderpass(value: GLESForwardAddClusterRP) {
        this._renderpass = value;
        this._nativeObj.setForwardAddClusterRP(value._nativeObj);
    }

    private _enablePostProcess: boolean;
    public get enablePostProcess(): boolean {
        return this._nativeObj.enablePostProcess;
    }
    public set enablePostProcess(value: boolean) {
        this._enablePostProcess = value;
        this._nativeObj.enablePostProcess = value;
    }
    /**@internal */
    private _postProcess: CommandBuffer;
    public get postProcess(): CommandBuffer {
        return this._postProcess;
    }
    public set postProcess(value: CommandBuffer) {
        this._postProcess = value;
        value._apply(false);
        this._nativeObj.setPostProcess(this._getRenderCMDArray(value._renderCMDs));
    }

    /**@internal */
    private _finalize: CommandBuffer = new CommandBuffer();
    public get finalize(): CommandBuffer {
        return this.finalize;
    }
    public set finalize(value: CommandBuffer) {
        this._finalize = value;
        value._apply(false);
        this._nativeObj.setfinalize(this._getRenderCMDArray(value._renderCMDs));
    }

    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchGLESForwardAddRP();
        this.shadowCastPass = false;
        this.enableDirectLightShadow = false;
        this.enableSpotLightShadowPass = false;
        this.directLightShadowPass = new GLESDirectLightShadowRP();
        this.spotLightShadowPass = new GLESSpotLightShadowRP();
        this.renderpass = new GLESForwardAddClusterRP();
    }

    private _getRenderCMDArray(cmds: IRenderCMD[]) {
        let nativeobCMDs: any[] = [];
        cmds.forEach(element => {
            nativeobCMDs.push((element as any)._nativeObj);
        });
        return nativeobCMDs;
    }

    setAfterEventCmd(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._nativeObj.clearAfterAllRenderCmds();
            value.forEach(element => {
                element._apply(false);
                this._nativeObj.addAfterAllRenderCmds(this._getRenderCMDArray(element._renderCMDs));
            });
        } else {
            this._nativeObj.clearAfterAllRenderCmds();
        }
    }

    setBeforeImageEffect(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._nativeObj.clearBeforeImageEffectCmds();
            value.forEach(element => {
                element._apply(false);
                this._nativeObj.addBeforeImageEffectCmds(this._getRenderCMDArray(element._renderCMDs));
            });
        } else {
            this._nativeObj.clearBeforeImageEffectCmds();
        }
    }
}