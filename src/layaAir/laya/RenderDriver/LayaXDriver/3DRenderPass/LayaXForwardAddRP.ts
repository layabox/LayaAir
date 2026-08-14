import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { LayaXDirCascadeShadowRP } from "./LayaXDirCascadeShadowRP";
import { LayaXForwardAddClusterRP } from "./LayaXForwardAddClusterRP";
import { LayaXBaseSpotRP } from "./LayaXBaseSpotRP";

/**
 * TS-owned enable-flag block. Contract shared with C++ `LayaXForwardAddRP_JS`
 * (RT3DRenderPass reads it each camera/frame) — changing it requires updating both sides.
 */
const enum FARPSlot {
    ShadowCastPass = 0,            // i32 (0/1)
    EnableDirectLightShadow = 1,   // i32 (0/1)
    EnableSpotLightShadowPass = 2, // i32 (0/1)
    EnablePostProcess = 3,         // i32 (0/1)
    Count = 4,
}

export class LayaXForwardAddRP {

    // TS owns this buffer; C++ caches its pointer via bindBuffer. Held as an instance
    // field so it stays alive (GC) for the pass's lifetime.
    private _buf: ArrayBuffer;
    private _i32: Int32Array;

    public get shadowCastPass(): boolean {
        return this._i32[FARPSlot.ShadowCastPass] !== 0;
    }
    public set shadowCastPass(value: boolean) {
        this._i32[FARPSlot.ShadowCastPass] = value ? 1 : 0;
    }

    public get enableDirectLightShadow(): boolean {
        return this._i32[FARPSlot.EnableDirectLightShadow] !== 0;
    }
    public set enableDirectLightShadow(value: boolean) {
        this._i32[FARPSlot.EnableDirectLightShadow] = value ? 1 : 0;
    }

    public get enableSpotLightShadowPass(): boolean {
        return this._i32[FARPSlot.EnableSpotLightShadowPass] !== 0;
    }
    public set enableSpotLightShadowPass(value: boolean) {
        this._i32[FARPSlot.EnableSpotLightShadowPass] = value ? 1 : 0;
    }

    public get enablePostProcess(): boolean {
        return this._i32[FARPSlot.EnablePostProcess] !== 0;
    }
    public set enablePostProcess(value: boolean) {
        this._i32[FARPSlot.EnablePostProcess] = value ? 1 : 0;
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
        this._buf = new ArrayBuffer(FARPSlot.Count * 4);
        this._i32 = new Int32Array(this._buf);
        this._nativeObj.bindBuffer(this._buf);
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
