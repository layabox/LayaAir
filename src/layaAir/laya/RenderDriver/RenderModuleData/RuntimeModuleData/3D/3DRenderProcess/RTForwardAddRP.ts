
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { IRenderCMD } from "../../../../DriverDesign/RenderDevice/IRenderCMD";
import { RTDirCascadeShadowRP } from "./RTDirCascadeShadowRP";
import { RTForwardAddClusterRP } from "./RTForwardAddClusterRP";
import { RTBaseSpotRP } from "./RTBaseSpotRP";


export class RTForwardAddRP {
    public get shadowCastPass(): boolean {
        return this._nativeObj.shadowCastPass;
    }
    public set shadowCastPass(value: boolean) {
        this._nativeObj.shadowCastPass = value;
    }

    public get enableDirectLightShadow(): boolean {
        return this._nativeObj.enableDirectLightShadow;
    }
    public set enableDirectLightShadow(value: boolean) {
        this._nativeObj.enableDirectLightShadow = value;
    }

    public get enableSpotLightShadowPass(): boolean {
        return this._nativeObj.enableSpotLightShadowPass;
    }
    public set enableSpotLightShadowPass(value: boolean) {
        this._nativeObj.enableSpotLightShadowPass = value;
    }

    public get enablePostProcess(): boolean {
        return this._nativeObj.enablePostProcess;
    }
    public set enablePostProcess(value: boolean) {
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
        return this._finalize;
    }
    public set finalize(value: CommandBuffer) {
        this._finalize = value;
        value._apply(false);
        this._nativeObj.setfinalize(this._getRenderCMDArray(value._renderCMDs));
    }


    private _directLightShadowPass: RTDirCascadeShadowRP;
    public get directLightShadowPass(): RTDirCascadeShadowRP {
        return this._directLightShadowPass;
    }
    public set directLightShadowPass(value: RTDirCascadeShadowRP) {
        this._directLightShadowPass = value;
        this._nativeObj.setDirectLightShadowPass(value._nativeObj);
    }

    private _spotLightShadowPass: RTBaseSpotRP;
    public get spotLightShadowPass(): RTBaseSpotRP {
        return this._spotLightShadowPass;
    }
    public set spotLightShadowPass(value: RTBaseSpotRP) {
        this._spotLightShadowPass = value;
        this._nativeObj.setSpotLightShadowPass(value._nativeObj);
    }

    private _mainRenderpass: RTForwardAddClusterRP;
    public get mainRenderpass(): RTForwardAddClusterRP {
        return this._mainRenderpass;
    }
    public set mainRenderpass(value: RTForwardAddClusterRP) {
        this._mainRenderpass = value;
        this._nativeObj.setMainPass(value._nativeObj);
    }

    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTForwardAddRP();
        this.shadowCastPass = false;
        this.enableDirectLightShadow = false;
        this.enableSpotLightShadowPass = false;
        this.directLightShadowPass = new RTDirCascadeShadowRP();
        this.spotLightShadowPass = new RTBaseSpotRP();
        this.mainRenderpass = new RTForwardAddClusterRP();
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

    destroy() {
       
    }
}