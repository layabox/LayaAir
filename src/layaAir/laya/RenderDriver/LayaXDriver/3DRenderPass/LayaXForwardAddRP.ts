import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { LayaXDirCascadeShadowRP } from "./LayaXDirCascadeShadowRP";
import { LayaXForwardAddClusterRP } from "./LayaXForwardAddClusterRP";
import { LayaXBaseSpotRP } from "./LayaXBaseSpotRP";

export class LayaXForwardAddRP {

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

    private _dirLightShadowPass: LayaXDirCascadeShadowRP;
    public get dirShadowRenderPass(): LayaXDirCascadeShadowRP {
        return this._dirLightShadowPass;
    }
    public set dirShadowRenderPass(value: LayaXDirCascadeShadowRP) {
        this._dirLightShadowPass = value;
        this._nativeObj.setDirectLightShadowPass(value._nativeObj);
    }

    private _spotShadowRenderPass: LayaXBaseSpotRP;
    public get spotShadowRenderPass(): LayaXBaseSpotRP {
        return this._spotShadowRenderPass;
    }
    public set spotShadowRenderPass(value: LayaXBaseSpotRP) {
        this._spotShadowRenderPass = value;
        this._nativeObj.setSpotLightShadowPass(value._nativeObj);
    }

    private _mainRenderpass: LayaXForwardAddClusterRP;
    public get mainRenderpass(): LayaXForwardAddClusterRP {
        return this._mainRenderpass;
    }
    public set mainRenderpass(value: LayaXForwardAddClusterRP) {
        this._mainRenderpass = value;
        this._nativeObj.setMainPass(value._nativeObj);
    }

    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXForwardAddRP();
        this.shadowCastPass = false;
        this.enableDirectLightShadow = false;
        this.enableSpotLightShadowPass = false;
        this.dirShadowRenderPass = new LayaXDirCascadeShadowRP();
        this.spotShadowRenderPass = new LayaXBaseSpotRP();
        this.mainRenderpass = new LayaXForwardAddClusterRP();
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
