
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { IRenderCMD } from "../../../../DriverDesign/RenderDevice/IRenderCMD";
import { RTDirCascadeShadowRP } from "./RTDirCascadeShadowRP";
import { RTForwardAddClusterRP } from "./RTForwardAddClusterRP";
import { RTBaseSpotRP } from "./RTBaseSpotRP";
import { NativeMemory } from "../../NativeMemory";

/** @internal conchIForwardAddRP 共享块槽位（与 C++ IForwardAddRP::Props 一致）。 */
const enum RTForwardAddRPSlot {
    shadowCastPass = 0,
    enableDirectLightShadow = 1,
    enableSpotLightShadowPass = 2,
    enablePostProcess = 3,
    Count = 4,
}

export class RTForwardAddRP {
    public get shadowCastPass(): boolean {
        return this._i32[RTForwardAddRPSlot.shadowCastPass] !== 0;
    }
    public set shadowCastPass(value: boolean) {
        this._i32[RTForwardAddRPSlot.shadowCastPass] = value ? 1 : 0;
    }

    public get enableDirectLightShadow(): boolean {
        return this._i32[RTForwardAddRPSlot.enableDirectLightShadow] !== 0;
    }
    public set enableDirectLightShadow(value: boolean) {
        this._i32[RTForwardAddRPSlot.enableDirectLightShadow] = value ? 1 : 0;
    }

    public get enableSpotLightShadowPass(): boolean {
        return this._i32[RTForwardAddRPSlot.enableSpotLightShadowPass] !== 0;
    }
    public set enableSpotLightShadowPass(value: boolean) {
        this._i32[RTForwardAddRPSlot.enableSpotLightShadowPass] = value ? 1 : 0;
    }

    public get enablePostProcess(): boolean {
        return this._i32[RTForwardAddRPSlot.enablePostProcess] !== 0;
    }
    public set enablePostProcess(value: boolean) {
        this._i32[RTForwardAddRPSlot.enablePostProcess] = value ? 1 : 0;
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


    private _dirLightShadowPass: RTDirCascadeShadowRP;
    public get dirShadowRenderPass(): RTDirCascadeShadowRP {
        return this._dirLightShadowPass;
    }
    public set dirShadowRenderPass(value: RTDirCascadeShadowRP) {
        this._dirLightShadowPass = value;
        this._nativeObj.setDirectLightShadowPass(value._nativeObj);
    }

    private _spotShadowRenderPass: RTBaseSpotRP;
    public get spotShadowRenderPass(): RTBaseSpotRP {
        return this._spotShadowRenderPass;
    }
    public set spotShadowRenderPass(value: RTBaseSpotRP) {
        this._spotShadowRenderPass = value;
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
    private _mem: NativeMemory;
    private _i32: Int32Array;

    constructor() {
        this._nativeObj = new (window as any).conchRTForwardAddRP();
        this._mem = new NativeMemory(RTForwardAddRPSlot.Count * 4, false);
        this._i32 = this._mem.int32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        this.shadowCastPass = false;
        this.enableDirectLightShadow = false;
        this.enableSpotLightShadowPass = false;
        this.dirShadowRenderPass = new RTDirCascadeShadowRP();
        this.spotShadowRenderPass = new RTBaseSpotRP();
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